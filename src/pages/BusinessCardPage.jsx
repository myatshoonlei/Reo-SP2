import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Phone, Mail, Download, Building, ImageDown } from "lucide-react";
import { toPng } from 'html-to-image';
import ReactDOM from 'react-dom/client';

// --- TEMPLATE COMPONENTS ---
// Importing your actual template components from their files.
// Please adjust the path if it's different in your project structure.
import Template1 from '../components/templates/Template1';
import Template2 from '../components/templates/Template2';
import Template3 from '../components/templates/Template3';


// Maps template names from the database to the actual imported React components.
// The names ('Template1', 'Template2') should match what's stored in your database.
const templateMap = {
    Template1: Template1,
    Template2: Template2,
    Template3: Template3,
    // Add other templates here as needed
};


const BusinessCardPage = () => {
    const { id } = useParams();
    const [card, setCard] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        // This check runs once after the component mounts to determine the device type.
        setIsMobileDevice(/Mobi|Android/i.test(navigator.userAgent));

        const fetchCard = async () => {
            try {
                // This single fetch should now return all data from your 'personal_cards' table,
                // including the 'template' field (e.g., "Template1").
                const res = await fetch(`http://localhost:5000/api/card/${id}`);
                const data = await res.json();
                setCard(data);
            } catch (err) {
                console.error("Error loading card:", err);
            }
        };

        fetchCard();
    }, [id]);

    const handleSaveContact = () => {
        if (!card) return;
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${card.fullname}
ORG:${card.company_name}
TITLE:${card.job_title}
TEL;TYPE=WORK,VOICE:${card.phone_number}
EMAIL:${card.email}
END:VCARD`;
        const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${card.fullname}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveVirtualCard = async () => {
        if (!card || !card.template) {
            alert("Card data or template is missing.");
            return;
        }

        // Dynamically select the component based on card data
        const TemplateComponent = templateMap[card.template];
        if (!TemplateComponent) {
            alert(`Template "${card.template}" not found.`);
            return;
        }

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);

        const LOGICAL_W = 350;
        const LOGICAL_H = 200;

        root.render(
            <React.Fragment>
                <div id="card-front-capture" style={{ width: LOGICAL_W, height: LOGICAL_H }}>
                    <TemplateComponent {...card} side="front" />
                </div>
                <div id="card-back-capture" style={{ width: LOGICAL_W, height: LOGICAL_H }}>
                    <TemplateComponent {...card} side="back" />
                </div>
            </React.Fragment>
        );

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const frontEl = container.querySelector('#card-front-capture');
            const backEl = container.querySelector('#card-back-capture');

            if (!frontEl || !backEl) throw new Error("Could not find elements to capture.");

            let fontCss = '';
            try {
                const fontUrl = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&display=swap";
                const response = await fetch(`http://localhost:5000/api/proxy/font-css?url=${encodeURIComponent(fontUrl)}`);
                if (response.ok) fontCss = await response.text();
            } catch (e) {
                console.warn('Could not fetch fonts, proceeding without them.');
            }

            const options = { pixelRatio: 2, cacheBust: true, fontEmbedCSS: fontCss };

            const [frontDataUrl, backDataUrl] = await Promise.all([
                toPng(frontEl, options),
                toPng(backEl, options)
            ]);
            
            const loadImg = (src) => new Promise((res, rej) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = src;
            });

            const [frontImg, backImg] = await Promise.all([
                loadImg(frontDataUrl),
                loadImg(backDataUrl)
            ]);

            const GAP = 20;
            const canvas = document.createElement("canvas");
            canvas.width = frontImg.width;
            canvas.height = frontImg.height + backImg.height + GAP;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#e0e0e0"; // A neutral background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(frontImg, 0, 0);
            ctx.drawImage(backImg, 0, frontImg.height + GAP);

            const finalDataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `${card.fullname}-card-both-sides.png`;
            link.href = finalDataUrl;
            link.click();

        } catch (err) {
            console.error('Failed to create card image:', err);
            alert('Sorry, there was an error downloading the card image.');
        } finally {
            root.unmount();
            document.body.removeChild(container);
        }
    };


    if (!card) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <p className="text-center text-gray-500">Loading card...</p>
            </div>
        );
    }

    // Build the list of actions dynamically
    const actions = [
        { label: card.phone_number, href: `tel:${card.phone_number}`, Icon: Phone, type: 'link', dark: true, iconColor: "text-[#1F2937]" },
        { label: card.email, href: `mailto:${card.email}`, Icon: Mail, type: 'link', dark: true, iconColor: "text-[#1F2937]" },
    ];

    // Only add the "Save Contact" button if the user is on a mobile device
    if (isMobileDevice) {
        actions.push({ label: 'Save Contact', onClick: handleSaveContact, Icon: Download, type: 'button', dark: true, iconColor: "text-[#1F2937]" });
    }

    actions.push({ label: 'Save Virtual Card', onClick: handleSaveVirtualCard, Icon: ImageDown, type: 'button', dark: true, iconColor: "text-[#1F2937]" });


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F1F7FE] to-[#DDEBFA] px-4 py-20 flex flex-col justify-center items-center font-sans">
            <div className="w-full max-w-md mx-auto">
                <div className="rounded-3xl border border-white/80 bg-white/70 shadow-lg p-4 mb-4 text-center">
                    <img
                        src={card.logo || "https://via.placeholder.com/96"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-md mx-auto -mt-16"
                    />
                    <h1 className="text-2xl font-bold text-[#1e2a3a] mt-4">{card.fullname}</h1>
                    <p className="text-md text-[#5f748d]">{card.job_title}</p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-[#5f748d]">
                        <Building size={16} />
                        <span className="font-semibold">{card.company_name}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {actions.map(({ label, href, Icon, iconColor, onClick, type, dark }, i) => {
                        const content = (
                             <div className={` rounded-xl p-2 mb-2 flex items-center justify-between border ${dark ? "bg-transparent border-white/60" : "bg-white/70 border-white/80"} ${i % 2 !== 0 ? 'flex-row-reverse' : ''} gap-1`}>
                                 <div className={`flex-1 h-8 rounded-lg px-3 flex items-center justify-center text-base font-semibold ${dark ? "bg-[#1F2937] text-white" : "bg-white text-[#1F2937] border border-slate-200"}`}>
                                     {label}
                                 </div>
                                 <div className={`flex items-center justify-center rounded-lg w-8 h-8 ${dark ? "bg-white/10" : "bg-[#EDF2F7] border border-white/70"}`}>
                                     <Icon
                                         strokeWidth={2.5}
                                         className={`${iconColor} w-4 h-4`}
                                     />
                                 </div>
                             </div>
                        );

                        if (type === 'link') {
                            return <a key={label} href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
                        }
                        return <div key={label} onClick={onClick} className="cursor-pointer">{content}</div>;
                    })}
                </div>
                <div className="text-center mt-6 mb-1">
                    <button className="bg-[#1F2937] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-105">
                        Save Card to Reo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessCardPage;
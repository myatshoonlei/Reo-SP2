const Template2 = ({ name, title, company, email, phone, logo, primary_color, secondary_color }) => (
  <div
    className="w-[350px] h-[200px] rounded-xl shadow-lg p-5 font-inter flex flex-col justify-between"
    style={{ backgroundColor: secondary_color, color: primary_color }}
  >
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-sm opacity-80">{title}</p>
      </div>
      {logo && <img src={logo} alt="Logo" className="w-10 h-10" />}
    </div>
    <div className="text-sm mt-3">
      <p className="opacity-80">{company}</p>
      <p>{email}</p>
      <p>{phone}</p>
    </div>
  </div>
);

export default Template2;
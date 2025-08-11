const Template3 = ({ name, title, company, email, phone, logo, primary_color, secondary_color }) => (
  <div
    className="w-[350px] h-[200px] rounded-xl shadow-lg flex font-inter overflow-hidden"
    style={{ backgroundColor: secondary_color, color: primary_color }}
  >
    <div className="w-1/3 bg-white flex items-center justify-center p-2">
      {logo && <img src={logo} alt="Logo" className="w-10 h-10" />}
    </div>
    <div className="w-2/3 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-sm opacity-80">{title}</p>
      </div>
      <div className="text-xs">
        <p className="font-medium">{company}</p>
        <p>{email}</p>
        <p>{phone}</p>
      </div>
    </div>
  </div>
);

export default Template3;
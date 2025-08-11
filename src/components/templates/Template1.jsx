const Template1 = ({
  name,
  title,
  company,
  email,
  phone,
  logo,
  primary_color,
  secondary_color,
}) => (
  <div
    className="w-[350px] h-[200px] rounded-xl border shadow-md p-4 flex flex-col justify-between font-inter hover:shadow-lg transition-all"
    style={{ backgroundColor: secondary_color, color: primary_color }}
  >
    {/* Top Row: Logo & Name */}
    <div className="flex justify-between items-center">
      <img
        src={logo || "/default-logo.png"}
        alt="Logo"
        className="w-12 h-12 object-contain rounded"
      />
      <div className="text-right">
        <h2 className="font-bold text-lg">{name}</h2>
        <p className="text-sm">{title}</p>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t my-2" style={{ borderColor: primary_color }} />

    {/* Info Section */}
    <div className="text-sm leading-5 space-y-1">
      <p className="font-semibold">{company}</p>
      <p>{email}</p>
      <p>{phone}</p>
    </div>
  </div>
);

export default Template1;
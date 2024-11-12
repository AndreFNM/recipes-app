export default function FormField({ label, type = "text", ...props }) {
    return (
        <div className="space-y-2">
            <label className="block text-gray-600">{label}</label>
            {type === "textarea" ? (
                <textarea className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
            ) : (
                <input type={type} className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
            )}
        </div>
    );
}
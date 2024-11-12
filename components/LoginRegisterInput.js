export default function LoginRegisterInput({type, placeholder, value, onChange}) {
    return(
        <input
            type={type}
            placeholder={placeholder} 
            value={value}
            onChange={onChange}
            className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-sky-500 rounded-md"
        />
    );
}
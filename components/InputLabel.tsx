export default function InputLabel({ value, className = '', children = null, ...props }) {
    return (
        <label {...props} className={`block font-medium text-sm text-gray-700 ` + className}>
            {value ? value : children}
        </label>
    );
}

export default function ContactItem({ icon: Icon, text, href }) {
    return (
        <div className="flex items-start gap-3 text-slate-400 group cursor-default">
            <Icon size={18} weight="bold" className="text-blue-600 mt-0.5 shrink-0" />
            {href ? (
                <a href={href} className="leading-tight text-slate-300 hover:text-blue-400 transition-colors">
                    {text}
                </a>
            ) : (
                <span className="leading-tight text-slate-300">{text}</span>
            )}
        </div>
    );
}

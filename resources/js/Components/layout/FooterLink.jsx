import { Link } from '@inertiajs/react';

export default function FooterLink({ href, className = "", children }) {
    const isExternal = href.startsWith('http');
    const classes = `text-white hover:text-indigo-400 text-md font-medium transition-colors ${className}`;

    return (
        <li>
            {isExternal ? (
                <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ) : (
                <Link href={href} className={classes}>
                    {children}
                </Link>
            )}
        </li>
    );
}

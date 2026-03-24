import { Link } from '@inertiajs/react';

export default function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center text-center text-base font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${active
                ? 'text-blue-600 lg:bg-blue-600/10 lg:px-3 lg:py-2 lg:rounded-md transition-all ease-in-out'
                : 'text-slate-600 hover:text-blue-600 lg:px-3'
                }`}
        >
            {children}
        </Link>
    );
}

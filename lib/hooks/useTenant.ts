'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/utils/cookies';

export interface TenantInfo {
    slug: string;
    hostname: string;
    isCustomDomain: boolean;
}

export function useTenant(): TenantInfo | null {
    const [tenant, setTenant] = useState<TenantInfo | null>(null);

    useEffect(() => {
        // Lire le cookie tenant-slug défini par le middleware
        const slug = getCookie('tenant-slug');
        const hostname = window.location.hostname;

        if (slug) {
            setTenant({
                slug,
                hostname,
                isCustomDomain: !hostname.includes('dospa.ca'),
            });
        }
    }, []);

    return tenant;
}

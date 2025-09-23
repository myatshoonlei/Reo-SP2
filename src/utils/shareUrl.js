export const getPublicCardUrl = (id) => {
    const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    return `${BASE}/card/${id}`;
};

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { TribeMemberCard } from '../../components/features/TribeMemberCard';

import { GlassCard } from '../../components/ui/GlassCard';

// Temporary Mock Data Fallback until we enable full Firestore Fetch
import { REAL_USERS } from '../../data/mockUsers';

export const CatalogScreen: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]); // TODO: Type properly
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating Fetch - In real V3 this comes from Firestore 'users' collection
        // For now we map the huge REAL_USERS array to our format to ensure data visibility
        const mappedUsers = REAL_USERS.map(u => ({
            id: u.email, // Using email as ID for compatibility with previous logic
            name: u.name,
            category: u.category,
            instagram: u.instagram,
            city: u.city,
            photoURL: u.avatarUrl || u.companyLogoUrl // Corrected property names
        }));
        setUsers(mappedUsers);
        setLoading(false);
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Explorar Tribu 🌎</h1>

            {/* Search Bar */}
            <GlassCard className="mb-6 flex items-center gap-3" padding="p-3">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o rubro..."
                    className="bg-transparent border-none outline-none text-gray-900 w-full placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </GlassCard>

            {/* Grid */}
            {loading ? (
                <p>Cargando directorio...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.slice(0, 50).map((user) => ( // Limit to 50 for performance
                        <TribeMemberCard
                            key={user.id}
                            name={user.name}
                            category={user.category}
                            instagram={user.instagram}
                            city={user.city}
                            imageUrl={user.photoURL}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

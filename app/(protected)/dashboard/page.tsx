'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, setUser, isLoadingAuth, setIsLoadingAuth } = useAppStore();
    const [isSignOutLoading, setIsSignOutLoading] = useState(false);

    // Auth protection
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            } else {
                router.push('/login');
            }
            setIsLoadingAuth(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [router, setUser, setIsLoadingAuth]);

    // Fetch initial count
    const { data: eventsCount = 0, isLoading: isLoadingCount } = useQuery({
        queryKey: ['events-count'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count || 0;
        },
        enabled: !!user,
    });

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('events-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'events' },
                (payload) => {
                    console.log('New event received!', payload);
                    // Invalidate query to refetch or manually increment
                    queryClient.setQueryData(['events-count'], (oldData: number | undefined) => {
                        return (oldData || 0) + 1;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const handleSignOut = async () => {
        setIsSignOutLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    if (isLoadingAuth) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <Button variant="outline" onClick={handleSignOut} disabled={isSignOutLoading}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {isSignOutLoading ? 'Signing out...' : 'Sign out'}
                    </Button>
                </header>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>Realtime Events Dashboard</CardTitle>
                            <CardDescription>Listening to the "events" table for INSERTs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                    Total Events
                                </p>
                                {isLoadingCount ? (
                                    <div className="text-5xl font-bold animate-pulse">...</div>
                                ) : (
                                    <div className="text-6xl font-extrabold text-blue-600">
                                        {eventsCount}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

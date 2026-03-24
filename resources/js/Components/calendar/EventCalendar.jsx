import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import CalendarHeader from './CalendarHeader';
import FilterBar from './FilterBar';
import EventDetailCard from './EventDetailCard';
import CalendarSearchBar from './CalendarSearchBar';
import EventListView from './EventListView';

export default function EventCalendar({
    initialMonth,
    initialYear,
    events = [],
    filters,
    initialSearch = '',
    showJumpMonths = true,
}) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [search, setSearch] = useState(initialSearch ?? '');
    const [isFirstRender, setIsFirstRender] = useState(true);

    // Keep local search state in sync if the server sends a new value
    useEffect(() => {
        setSearch(initialSearch ?? '');
    }, [initialSearch]);

    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    // Debounced search that updates only the `search` param and preserves other query params
    useEffect(() => {
        if (isFirstRender) return;

        const handle = setTimeout(() => {
            const searchParams = new URLSearchParams(
                window.location.search ?? '',
            );

            if (search && search.trim().length > 0) {
                searchParams.set('search', search.trim());
            } else {
                searchParams.delete('search');
            }

            const data = Object.fromEntries(searchParams.entries());
            // Ensure locale is included from localStorage
            const locale = localStorage.getItem('app_language') || 'en';
            const dataWithLocale = { ...data, locale };

            router.get(route('calendar.index'), dataWithLocale, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'events',
                    'filters',
                    'meta',
                    'initialMonth',
                    'initialYear',
                    'locale',
                ],
            });
        }, 400);

        return () => clearTimeout(handle);
    }, [search, isFirstRender]);

    // Ensure events is an array
    const safeEvents = Array.isArray(events) ? events : [];

    // Create a map of events by ID for efficient lookup when selecting related events
    // This recursively includes ALL nested events (related and co-located) at all levels
    // Events with more complete data (having related/co-located events) take precedence
    const eventsById = useMemo(() => {
        const map = new Map();
        const processed = new Set(); // Track processed event IDs to avoid infinite loops

        // Recursive function to add an event and all its nested events to the map
        const addEventRecursively = (event) => {
            if (!event || !event.id || processed.has(event.id)) {
                return;
            }

            processed.add(event.id);

            // Check if we already have this event in the map
            const existing = map.get(event.id);

            // If we don't have it, or if the new one has more complete data (has related/co-located events),
            // add/update it in the map
            if (!existing ||
                (!existing.relatedEvents?.length && !existing.colocatedEvents?.length) &&
                (event.relatedEvents?.length || event.colocatedEvents?.length)) {
                map.set(event.id, event);
            }

            // Recursively process nested events
            if (event.relatedEvents && Array.isArray(event.relatedEvents)) {
                event.relatedEvents.forEach((related) => {
                    addEventRecursively(related);
                });
            }
            if (event.colocatedEvents && Array.isArray(event.colocatedEvents)) {
                event.colocatedEvents.forEach((colocated) => {
                    addEventRecursively(colocated);
                });
            }
        };

        // Start with all main events
        safeEvents.forEach((event) => {
            addEventRecursively(event);
        });

        return map;
    }, [safeEvents]);

    return (
        <div className="relative overflow-hidden card-surface bg-brand-bg">
            <CalendarHeader
                currentMonth={initialMonth}
                currentYear={initialYear}
                showJumpMonths={showJumpMonths}
            />
            <FilterBar />
            <CalendarSearchBar search={search} onSearchChange={setSearch} />
            <div className="bg-gradient-to-b from-brand-bg to-brand-bg">
                <EventListView
                    events={safeEvents}
                    initialMonth={initialMonth}
                    initialYear={initialYear}
                    onEventSelect={setSelectedEvent}
                />
            </div>
            <EventDetailCard
                event={
                    selectedEvent && {
                        ...selectedEvent,
                        onSelectRelated: (related) => {
                            if (!related?.id) {
                                setSelectedEvent(related);
                                return;
                            }

                            // Get the event from the map (which now includes all nested events recursively)
                            let fullEvent = eventsById.get(related.id);

                            // If event doesn't have related/co-located events, build them from the current selected event
                            // Co-located events are bidirectional - if A is co-located with B, then B should show A and other co-located events
                            if (fullEvent && (!fullEvent.relatedEvents?.length && !fullEvent.colocatedEvents?.length) && selectedEvent) {
                                // Find all events that are co-located with the current selected event
                                const currentColocatedEvents = selectedEvent.colocatedEvents || [];
                                const currentRelatedEvents = selectedEvent.relatedEvents || [];

                                // Build co-located events list: all other co-located events from the current event, plus the current event itself
                                const newColocatedEvents = currentColocatedEvents
                                    .filter((e) => e.id !== related.id) // Exclude the clicked event
                                    .map((e) => eventsById.get(e.id) || e); // Get full event data if available

                                // Add the current selected event to the co-located list (bidirectional relationship)
                                if (selectedEvent.id && selectedEvent.id !== related.id) {
                                    newColocatedEvents.push(selectedEvent);
                                }

                                // Build related events list similarly
                                const newRelatedEvents = currentRelatedEvents
                                    .filter((e) => e.id !== related.id)
                                    .map((e) => eventsById.get(e.id) || e);

                                if (newColocatedEvents.length > 0 || newRelatedEvents.length > 0) {
                                    fullEvent = {
                                        ...fullEvent,
                                        colocatedEvents: newColocatedEvents,
                                        relatedEvents: newRelatedEvents,
                                    };
                                }
                            }

                            if (fullEvent) {
                                // Merge the related event's data with the full event object
                                // This preserves any additional data from the related event
                                // while ensuring we have the full event's relatedEvents and colocatedEvents
                                const mergedEvent = {
                                    ...fullEvent,
                                    ...related,
                                    // Ensure we use the full event's related/co-located events if they exist
                                    relatedEvents: fullEvent.relatedEvents || related.relatedEvents,
                                    colocatedEvents: fullEvent.colocatedEvents || related.colocatedEvents,
                                };

                                setSelectedEvent(mergedEvent);
                            } else {
                                // If not found in map, use the related event as-is
                                setSelectedEvent(related);
                            }
                        },
                    }
                }
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}

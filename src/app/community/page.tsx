'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './community.module.css';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';

interface Post {
    id: number;
    author: string;
    flag: string;
    type: string;
    title: string;
    desc: string;
    time: string;
    comments: number;
    start_time?: string;
    end_time?: string;
    place_name?: string;
    place_lat?: number;
    place_lng?: number;
}

export default function CommunityPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [filter, setFilter] = useState<string>('all');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isWriting, setIsWriting] = useState(false);
    const [newType, setNewType] = useState('meetup');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [placeName, setPlaceName] = useState('');

    // For simplicity, we can default these or let the user choose. We'll set a default Seoul coordinate if a place name is given.
    const [placeLat, setPlaceLat] = useState<number | null>(null);
    const [placeLng, setPlaceLng] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPostId, setEditingPostId] = useState<number | null>(null);

    const [loggedInUserName, setLoggedInUserName] = useState("Jessie Kim");

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data as Post[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.name) setLoggedInUserName(parsed.name);
            }
        } catch (e) {
            // ignore
        }
        fetchPosts();
    }, []);

    // Comment logic moved to detail page

    const handleDeletePost = async (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await supabase.from('community_posts').delete().eq('id', id);
            fetchPosts();
        }
    };

    const handleSubmit = async () => {
        if (!newTitle.trim() || !newDesc.trim()) return;
        setIsSubmitting(true);

        const fakeUser = { author: loggedInUserName, flag: '🌍' };

        if (editingPostId) {
            const { error } = await supabase.from('community_posts').update({
                type: newType,
                title: newTitle,
                desc: newDesc,
                start_time: startTime || null,
                end_time: endTime || null,
                place_name: placeName || null,
                place_lat: placeName ? (placeLat || 37.5665) : null,
                place_lng: placeName ? (placeLng || 126.9780) : null
            }).eq('id', editingPostId);

            if (!error) {
                setIsWriting(false);
                setEditingPostId(null);
                setNewTitle('');
                setNewDesc('');
                setStartTime('');
                setEndTime('');
                setPlaceName('');
                fetchPosts(); // Reload feed
            } else {
                alert('Failed to update. Server might not have these columns yet.');
            }
        } else {
            const { error } = await supabase.from('community_posts').insert([{
                author: fakeUser.author,
                flag: fakeUser.flag,
                type: newType,
                title: newTitle,
                desc: newDesc,
                time: 'Just now',
                comments: 0,
                start_time: startTime || null,
                end_time: endTime || null,
                place_name: placeName || null,
                place_lat: placeName ? (placeLat || 37.5665) : null,
                place_lng: placeName ? (placeLng || 126.9780) : null
            }]);

            if (!error) {
                setIsWriting(false);
                setNewTitle('');
                setNewDesc('');
                setStartTime('');
                setEndTime('');
                setPlaceName('');
                fetchPosts(); // Reload feed
            } else {
                alert('Failed to post. Server might not have these columns yet. Error: ' + error.message);
            }
        }
        setIsSubmitting(false);
    };

    const handleEditPost = (post: Post) => {
        setEditingPostId(post.id);
        setNewType(post.type);
        setNewTitle(post.title);
        setNewDesc(post.desc);
        setStartTime(post.start_time || '');
        setEndTime(post.end_time || '');
        setPlaceName(post.place_name || '');
        setPlaceLat(post.place_lat || null);
        setPlaceLng(post.place_lng || null);
        setIsWriting(true);
    };

    const filteredPosts = posts.filter(p => {
        const matchesFilter = filter === 'all' || p.type === filter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('community_page.title', { defaultValue: 'Community' })}</h1>
                <p className={styles.subtitle}>{t('community_page.subtitle', { defaultValue: 'Connect with locals & travelers' })}</p>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={t('community_page.search_placeholder', { defaultValue: 'Search community...' })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${filter === 'all' ? styles.activeTab : ''}`} onClick={() => setFilter('all')}>{t('community_page.filter_all', { defaultValue: 'All' })}</button>
                    <button className={`${styles.tab} ${filter === 'meetup' ? styles.activeTab : ''}`} onClick={() => setFilter('meetup')}>{t('community_page.filter_meetup', { defaultValue: 'Food & Meetup' })}</button>
                    <button className={`${styles.tab} ${filter === 'travel' ? styles.activeTab : ''}`} onClick={() => setFilter('travel')}>{t('community_page.filter_travel', { defaultValue: 'Travel Mate' })}</button>
                    <button className={`${styles.tab} ${filter === 'help' ? styles.activeTab : ''}`} onClick={() => setFilter('help')}>{t('community_page.filter_help', { defaultValue: 'Local Help' })}</button>
                    <button className={`${styles.tab} ${filter === 'review' ? styles.activeTab : ''}`} onClick={() => setFilter('review')}>{t('community_page.filter_review', { defaultValue: 'Reviews' })}</button>
                </div>
            </header>

            <div className={styles.feed}>
                {loading ? (
                    <div className={styles.emptyState}>Loading posts...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className={styles.emptyState}>No posts yet. Be the first to share!</div>
                ) : (
                    filteredPosts.map(post => (
                        <div key={post.id} className={styles.card} onClick={() => router.push(`/community/${post.id}`)} style={{ cursor: 'pointer' }}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>{post.flag}</div>
                                <div className={styles.authorInfo}>
                                    <div className={styles.authorName}>{post.author}</div>
                                    <div className={styles.postTime}>{post.time}</div>
                                </div>
                                <div className={`${styles.badge} ${styles['badge_' + post.type]}`}>
                                    {t(`community_page.type.${post.type.toUpperCase()}`, { defaultValue: post.type.toUpperCase() })}
                                </div>
                                {post.author === loggedInUserName && (
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                        <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}>
                                            {t('community_page.edit', { defaultValue: 'Edit' })}
                                        </button>
                                        <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}>
                                            {t('community_page.delete', { defaultValue: 'Delete' })}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.postDesc}>{post.desc}</p>
                            {(post.start_time || post.place_name) && (
                                <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--gray-600)', background: 'var(--gray-100)', padding: '8px', borderRadius: '8px' }}>
                                    {post.start_time && <div>🕒 {post.start_time} {post.end_time ? ` ~ ${post.end_time}` : ''}</div>}
                                    {post.place_name && <div>📍 {post.place_name}</div>}
                                </div>
                            )}
                            <div className={styles.cardFooter}>
                                <button className={styles.actionBtn}>
                                    💬 {post.comments} {t('community_page.comments', { defaultValue: 'Comments' })}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New / Edit Post Button */}
            <button className={styles.fab} onClick={() => {
                setEditingPostId(null);
                setNewType('meetup');
                setNewTitle('');
                setNewDesc('');
                setStartTime('');
                setEndTime('');
                setPlaceName('');
                setPlaceLat(null);
                setPlaceLng(null);
                setIsWriting(true);
            }}>
                <span>✏️</span> {t('community_page.write_post', { defaultValue: 'Write Post' })}
            </button>

            {isWriting && (
                <div className={styles.modalOverlay} onClick={() => setIsWriting(false)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingPostId
                                    ? t('community_page.edit', { defaultValue: 'Edit Post' })
                                    : t('community_page.write_post', { defaultValue: 'Write Post' })
                                }
                            </h2>
                            {/* Home/Close button removed as requested */}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{t('community_page.form_category', { defaultValue: 'Category' })}</label>
                            <select className={styles.formSelect} value={newType} onChange={e => setNewType(e.target.value)}>
                                <option value="meetup">{t('community_page.filter_meetup', { defaultValue: 'Food & Meetup' })}</option>
                                <option value="travel">{t('community_page.filter_travel', { defaultValue: 'Travel Mate' })}</option>
                                <option value="help">{t('community_page.filter_help', { defaultValue: 'Local Help' })}</option>
                                <option value="review">{t('community_page.filter_review', { defaultValue: 'Reviews' })}</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{t('community_page.form_title', { defaultValue: 'Title' })}</label>
                            <input
                                className={styles.formInput}
                                placeholder={t('community_page.form_title_ph', { defaultValue: "E.g. Let's eat Samgyeopsal tonight!" })}
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{t('community_page.form_desc', { defaultValue: 'Description' })}</label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder={t('community_page.form_desc_ph', { defaultValue: "Share details about what you want to do/need..." })}
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.formLabel}>{t('community_page.form_start_time', { defaultValue: 'Start Time (Optional)' })}</label>
                                <input
                                    type="time"
                                    className={styles.formInput}
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.formLabel}>{t('community_page.form_end_time', { defaultValue: 'End Time (Optional)' })}</label>
                                <input
                                    type="time"
                                    className={styles.formInput}
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{t('community_page.form_place', { defaultValue: 'Meeting Place (Optional)' })}</label>
                            <input
                                className={styles.formInput}
                                placeholder={t('community_page.form_place_ph', { defaultValue: "E.g. Gangnam Station Exit 11" })}
                                value={placeName}
                                onChange={e => setPlaceName(e.target.value)}
                            />
                            <small style={{ color: 'var(--gray-500)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                Entering a place name will automatically attach a map view to your post.
                            </small>
                        </div>

                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={isSubmitting || !newTitle || !newDesc}
                        >
                            {isSubmitting
                                ? t('community_page.posting', { defaultValue: 'Posting...' })
                                : editingPostId
                                    ? t('community_page.update_post', { defaultValue: 'Update Post' })
                                    : t('community_page.post_btn', { defaultValue: 'Post to Community' })
                            }
                        </button>
                    </div>
                </div>
            )}

            <div style={{ height: 100 }} />
        </div>
    );
}

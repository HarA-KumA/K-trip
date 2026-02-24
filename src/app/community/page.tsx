'use client';

import { useState, useEffect } from 'react';
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
}

export default function CommunityPage() {
    const { t } = useTranslation('common');
    const [filter, setFilter] = useState<string>('all');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isWriting, setIsWriting] = useState(false);
    const [newType, setNewType] = useState('meetup');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPostId, setEditingPostId] = useState<number | null>(null);

    const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
    const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

    const loadComments = async (postId: number) => {
        const { data, error } = await supabase
            .from('community_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setCommentsMap(prev => ({ ...prev, [postId]: data }));
        }
    };

    const handleToggleComments = (post: Post) => {
        if (activeCommentPost === post.id) {
            setActiveCommentPost(null);
        } else {
            setActiveCommentPost(post.id);
            setNewComment('');
            loadComments(post.id);
        }
    };

    const handleSubmitComment = async (postId: number) => {
        if (!newComment.trim()) return;
        setIsSubmittingComment(true);
        const { error } = await supabase.from('community_comments').insert([{
            post_id: postId,
            author: loggedInUserName,
            content: newComment
        }]);
        if (!error) {
            setNewComment('');
            loadComments(postId);
            // Update comments count lightly
            const post = posts.find(p => p.id === postId);
            if (post) {
                await supabase.from('community_posts').update({ comments: post.comments + 1 }).eq('id', postId);
                fetchPosts();
            }
        }
        setIsSubmittingComment(false);
    };

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
                desc: newDesc
            }).eq('id', editingPostId);

            if (!error) {
                setIsWriting(false);
                setEditingPostId(null);
                setNewTitle('');
                setNewDesc('');
                fetchPosts(); // Reload feed
            } else {
                alert('Failed to update.');
            }
        } else {
            const { error } = await supabase.from('community_posts').insert([{
                author: fakeUser.author,
                flag: fakeUser.flag,
                type: newType,
                title: newTitle,
                desc: newDesc,
                time: 'Just now',
                comments: 0
            }]);

            if (!error) {
                setIsWriting(false);
                setNewTitle('');
                setNewDesc('');
                fetchPosts(); // Reload feed
            } else {
                alert('Failed to post. Have you created the table in Supabase yet?');
            }
        }
        setIsSubmitting(false);
    };

    const handleEditPost = (post: Post) => {
        setEditingPostId(post.id);
        setNewType(post.type);
        setNewTitle(post.title);
        setNewDesc(post.desc);
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
                        <div key={post.id} className={styles.card}>
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
                                        <button className={styles.deleteBtn} onClick={() => handleEditPost(post)}>
                                            {t('community_page.edit', { defaultValue: 'Edit' })}
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => handleDeletePost(post.id)}>
                                            {t('community_page.delete', { defaultValue: 'Delete' })}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.postDesc}>{post.desc}</p>
                            <div className={styles.cardFooter}>
                                <button className={styles.actionBtn} onClick={() => handleToggleComments(post)}>
                                    💬 {commentsMap[post.id] ? commentsMap[post.id].length : post.comments} {t('community_page.comments', { defaultValue: 'Comments' })}
                                </button>
                            </div>

                            {/* Comment Section Expansion */}
                            {activeCommentPost === post.id && (
                                <div className={styles.commentSection}>
                                    <div className={styles.commentList}>
                                        {(commentsMap[post.id] || []).map(comment => (
                                            <div key={comment.id} className={styles.commentItem}>
                                                <div className={styles.commentAuthor}>{comment.author}</div>
                                                <div className={styles.commentContent}>{comment.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.commentInputBox}>
                                        <input
                                            className={styles.commentInput}
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSubmitComment(post.id)}
                                        />
                                        <button
                                            className={styles.commentSubmit}
                                            disabled={!newComment.trim() || isSubmittingComment}
                                            onClick={() => handleSubmitComment(post.id)}
                                        >
                                            ➤
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            <button className={styles.closeBtn} onClick={() => setIsWriting(false)}>×</button>
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

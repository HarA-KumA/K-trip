'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import styles from './detail.module.css';

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

interface Comment {
    id: number;
    author: string;
    content: string;
    created_at: string;
}

export default function CommunityDetailPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedInUserName, setLoggedInUserName] = useState("Jessie Kim");

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

        if (id) {
            fetchPostData();
        }
    }, [id]);

    const fetchPostData = async () => {
        setLoading(true);
        // Fetch Post
        const { data: postData, error: postError } = await supabase
            .from('community_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (postData) {
            setPost(postData);
        }

        // Fetch Comments
        const { data: commentsData } = await supabase
            .from('community_comments')
            .select('*')
            .eq('post_id', id)
            .order('created_at', { ascending: true });

        if (commentsData) {
            setComments(commentsData as Comment[]);
        }
        setLoading(false);
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !post) return;
        setIsSubmitting(true);
        const { error } = await supabase.from('community_comments').insert([{
            post_id: post.id,
            author: loggedInUserName,
            content: newComment
        }]);

        if (!error) {
            setNewComment('');
            // Update comments count lightly
            await supabase.from('community_posts').update({ comments: post.comments + 1 }).eq('id', post.id);
            fetchPostData();
        }
        setIsSubmitting(false);
    };

    if (loading) return <div className={styles.loading}>Loading post...</div>;
    if (!post) return <div className={styles.loading}>Post not found.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>←</button>
                <h1 className={styles.headerTitle}>{t('community_page.detail', { defaultValue: 'Post Detail' })}</h1>
            </header>

            <div className={styles.content}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.avatar}>{post.flag}</div>
                        <div className={styles.authorInfo}>
                            <div className={styles.authorName}>{post.author}</div>
                            <div className={styles.postTime}>{post.time}</div>
                        </div>
                        <div className={`${styles.badge} ${styles['badge_' + post.type]}`}>
                            {t(`community_page.type.${post.type.toUpperCase()}`, { defaultValue: post.type.toUpperCase() })}
                        </div>
                    </div>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    <p className={styles.postDesc}>{post.desc}</p>
                    <div className={styles.stats}>
                        💬 {comments.length} {t('community_page.comments', { defaultValue: 'Comments' })}
                    </div>
                </div>

                <div className={styles.commentSection}>
                    <h3 className={styles.commentTitle}>Comments</h3>
                    <div className={styles.commentList}>
                        {comments.length === 0 ? (
                            <div className={styles.emptyComments}>No comments yet.</div>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className={styles.commentItem}>
                                    <div className={styles.commentAuthor}>{c.author}</div>
                                    <div className={styles.commentContent}>{c.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.commentInputBox}>
                <input
                    className={styles.commentInput}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                />
                <button
                    className={styles.commentSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                    onClick={handleSubmitComment}
                >
                    {isSubmitting ? '...' : '➤'}
                </button>
            </div>
        </div>
    );
}

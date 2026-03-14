import React from 'react';
import styles from '@/css/home/Feedbacks.module.css';

const feedbackItems = [
    {
        id: 1,
        title: 'Homepage Hero Review',
        batch: 'Kodex Alpha 24',
        createdAt: '14 Mar 2026',
        endDate: '20 Mar 2026',
    },
    {
        id: 2,
        title: 'Checkout Flow Feedback',
        batch: 'Kodex Beta 12',
        createdAt: '12 Mar 2026',
        endDate: '18 Mar 2026',
    },
    {
        id: 3,
        title: 'Mobile Navigation Audit',
        batch: 'Kodex Gamma 08',
        createdAt: '10 Mar 2026',
        endDate: '16 Mar 2026',
    },
];

const Feedbacks = () => {
    return (
        <section id='feedbacks' className={styles.feedbacks}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Feedback Tracker</p>
                    <h1 className={styles.title}>Track every feedback card in one place.</h1>
                </div>

                <div className={styles.totalCard}>
                    <span className={styles.totalLabel}>Total Feedback</span>
                    <strong className={styles.totalCount}>{feedbackItems.length}</strong>
                </div>
            </div>

            <div className={styles.grid}>
                {feedbackItems.map((item, index) => (
                    <article key={item.id} className={styles.feedback}>
                        <div className={styles.cardTop}>
                            <span className={styles.cardIndex}>0{index + 1}</span>
                            <span className={styles.badge}>{feedbackItems.length} Feedback</span>
                        </div>

                        <h2 className={styles.cardTitle}>{item.title}</h2>

                        <div className={styles.metaGrid}>
                            <div className={styles.metaBlock}>
                                <span className={styles.metaLabel}>Batch</span>
                                <span className={styles.metaValue}>{item.batch}</span>
                            </div>

                            <div className={styles.metaBlock}>
                                <span className={styles.metaLabel}>Date Created</span>
                                <span className={styles.metaValue}>{item.createdAt}</span>
                            </div>

                            <div className={styles.metaBlock}>
                                <span className={styles.metaLabel}>End Date</span>
                                <span className={styles.metaValue}>{item.endDate}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default Feedbacks

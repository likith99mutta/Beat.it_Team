/**
 * Admin Dashboard Module
 * Handles loading and displaying dashboard data
 */

const AdminDashboard = {
    /**
     * Initialize the dashboard
     */
    init: async function() {
        try {
            console.log('Initializing Admin Dashboard');
            await this.loadStats();
            this.setupCharts();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    },

    /**
     * Load dashboard statistics
     */
    loadStats: async function() {
        try {
            // Find the stat value elements - check if they exist before updating
            const totalSongsElement = document.getElementById('total-songs');
            const totalUsersElement = document.getElementById('total-users');
            const storageUsedElement = document.getElementById('storage-used');
            const mostPlayedElement = document.getElementById('most-played');
            const recentActivityElement = document.getElementById('recent-activity');
            
            // Show loading indicators if elements exist
            if (totalSongsElement) totalSongsElement.innerText = 'Loading...';
            if (totalUsersElement) totalUsersElement.innerText = 'Loading...';
            if (storageUsedElement) storageUsedElement.innerText = 'Loading...';
            if (mostPlayedElement) mostPlayedElement.innerText = 'Loading...';
            
            // Fetch stats from API
            const response = await fetch('/api/admin/stats');
            
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
            
            const stats = await response.json();
            
            // Update stats in the UI if elements exist
            if (totalSongsElement) totalSongsElement.innerText = stats.totalSongs || 0;
            if (totalUsersElement) totalUsersElement.innerText = stats.totalUsers || 0;
            if (storageUsedElement) storageUsedElement.innerText = stats.storageUsed?.used || '0 MB';
            
            // Get most played song if available
            if (mostPlayedElement) {
                if (stats.topPlayedSongs && stats.topPlayedSongs.length > 0) {
                    const topSong = stats.topPlayedSongs[0];
                    mostPlayedElement.innerText = topSong.title;
                } else {
                    mostPlayedElement.innerText = 'No data';
                }
            }
            
            // Update recent activity if element exists
            if (recentActivityElement) {
                this.displayRecentActivity(stats.recentActivity || [], recentActivityElement);
            }
            
            // Store top songs for chart
            this.topSongs = stats.topPlayedSongs || [];
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            
            // Find elements and show error state
            const totalSongsElement = document.getElementById('total-songs');
            const totalUsersElement = document.getElementById('total-users');
            const storageUsedElement = document.getElementById('storage-used');
            const mostPlayedElement = document.getElementById('most-played');
            const recentActivityElement = document.getElementById('recent-activity');
            
            if (totalSongsElement) totalSongsElement.innerText = 'Error';
            if (totalUsersElement) totalUsersElement.innerText = 'Error';
            if (storageUsedElement) storageUsedElement.innerText = 'Error';
            if (mostPlayedElement) mostPlayedElement.innerText = 'Error';
            
            // Display error message in activity section if element exists
            if (recentActivityElement) {
                recentActivityElement.innerHTML = '<div class="admin-error">Failed to load dashboard data. Please try refreshing the page.</div>';
            }
        }
    },

    /**
     * Display recent activity
     */
    displayRecentActivity: function(activities, container) {
        const activityContainer = container || document.getElementById('recent-activity');
        
        if (!activityContainer) {
            console.warn('Recent activity container not found');
            return;
        }
        
        if (!activities || activities.length === 0) {
            activityContainer.innerHTML = '<p>No recent activity found.</p>';
            return;
        }
        
        let html = '<ul class="admin-activity-list">';
        
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const formattedDate = date.toLocaleString();
            
            html += `
                <li class="admin-activity-item">
                    <div class="activity-icon ${this.getActivityIconClass(activity.type)}">
                        <i class="${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-action">${this.formatActivityType(activity.type)}</div>
                        <div class="activity-info">${activity.user} - ${activity.item}</div>
                        <div class="activity-time">${formattedDate}</div>
                    </div>
                </li>
            `;
        });
        
        html += '</ul>';
        activityContainer.innerHTML = html;
    },

    /**
     * Setup charts
     */
    setupCharts: function() {
        const ctx = document.getElementById('top-songs-chart');
        
        if (!ctx) {
            console.warn('Chart canvas not found');
            return;
        }
        
        // If we have no top songs data, show placeholder
        if (!this.topSongs || this.topSongs.length === 0) {
            this.topSongs = [
                {title: 'Song 1', playCount: 250},
                {title: 'Song 2', playCount: 200},
                {title: 'Song 3', playCount: 150},
                {title: 'Song 4', playCount: 100},
                {title: 'Song 5', playCount: 50}
            ];
        }
        
        // Limit to top 5 songs
        const topSongs = this.topSongs.slice(0, 5);
        
        // Create chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topSongs.map(song => song.title),
                datasets: [{
                    label: 'Plays',
                    data: topSongs.map(song => song.playCount),
                    backgroundColor: 'rgba(74, 108, 247, 0.6)',
                    borderColor: 'rgba(74, 108, 247, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Get icon for activity type
     */
    getActivityIcon: function(type) {
        switch (type) {
            case 'upload': return 'fas fa-upload';
            case 'delete': return 'fas fa-trash';
            case 'edit': return 'fas fa-edit';
            case 'like': return 'fas fa-heart';
            case 'play': return 'fas fa-play';
            default: return 'fas fa-info-circle';
        }
    },

    /**
     * Get icon class for activity type
     */
    getActivityIconClass: function(type) {
        switch (type) {
            case 'upload': return 'icon-upload';
            case 'delete': return 'icon-delete';
            case 'edit': return 'icon-edit';
            case 'like': return 'icon-like';
            case 'play': return 'icon-play';
            default: return 'icon-default';
        }
    },

    /**
     * Format activity type
     */
    formatActivityType: function(type) {
        switch (type) {
            case 'upload': return 'Uploaded';
            case 'delete': return 'Deleted';
            case 'edit': return 'Edited';
            case 'like': return 'Liked';
            case 'play': return 'Played';
            default: return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
};

// Export the module
window.AdminDashboard = AdminDashboard; 
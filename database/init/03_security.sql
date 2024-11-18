-- Enable row level security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create security policies

-- Users policies
CREATE POLICY users_view_policy ON users
    FOR SELECT
    USING (
        id = current_setting('app.current_user_id', true)::UUID
        OR EXISTS (
            SELECT 1 FROM user_preferences up
            WHERE up.user_id = users.id
            AND up.privacy_settings->>'profileVisibility' = 'public'
        )
        OR EXISTS (
            SELECT 1 FROM user_follows uf
            WHERE uf.followee_id = users.id
            AND uf.follower_id = current_setting('app.current_user_id', true)::UUID
            AND EXISTS (
                SELECT 1 FROM user_preferences up
                WHERE up.user_id = users.id
                AND up.privacy_settings->>'profileVisibility' = 'friends'
            )
        )
    );

CREATE POLICY users_update_policy ON users
    FOR UPDATE
    USING (id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id = current_setting('app.current_user_id', true)::UUID);

-- User preferences policies
CREATE POLICY user_preferences_view_policy ON user_preferences
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY user_preferences_update_policy ON user_preferences
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Dreams policies
CREATE POLICY dreams_view_policy ON dreams
    FOR SELECT
    USING (
        user_id = current_setting('app.current_user_id', true)::UUID
        OR (
            visibility = 'public'
            OR (
                visibility = 'friends'
                AND EXISTS (
                    SELECT 1 FROM user_follows
                    WHERE follower_id = current_setting('app.current_user_id', true)::UUID
                    AND followee_id = dreams.user_id
                )
            )
        )
    );

CREATE POLICY dreams_modify_policy ON dreams
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::UUID);

-- Dream analyses policies
CREATE POLICY dream_analyses_view_policy ON dream_analyses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM dreams
            WHERE dreams.id = dream_analyses.dream_id
            AND (
                dreams.user_id = current_setting('app.current_user_id', true)::UUID
                OR dreams.visibility = 'public'
                OR (
                    dreams.visibility = 'friends'
                    AND EXISTS (
                        SELECT 1 FROM user_follows
                        WHERE follower_id = current_setting('app.current_user_id', true)::UUID
                        AND followee_id = dreams.user_id
                    )
                )
            )
        )
    );

CREATE POLICY dream_analyses_modify_policy ON dream_analyses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM dreams
            WHERE dreams.id = dream_analyses.dream_id
            AND dreams.user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- Comments policies
CREATE POLICY dream_comments_view_policy ON dream_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM dreams
            WHERE dreams.id = dream_comments.dream_id
            AND (
                dreams.user_id = current_setting('app.current_user_id', true)::UUID
                OR dreams.visibility = 'public'
                OR (
                    dreams.visibility = 'friends'
                    AND EXISTS (
                        SELECT 1 FROM user_follows
                        WHERE follower_id = current_setting('app.current_user_id', true)::UUID
                        AND followee_id = dreams.user_id
                    )
                )
            )
        )
    );

CREATE POLICY dream_comments_modify_policy ON dream_comments
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::UUID);

-- Reactions policies
CREATE POLICY dream_reactions_view_policy ON dream_reactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM dreams
            WHERE dreams.id = dream_reactions.dream_id
            AND (
                dreams.user_id = current_setting('app.current_user_id', true)::UUID
                OR dreams.visibility = 'public'
                OR (
                    dreams.visibility = 'friends'
                    AND EXISTS (
                        SELECT 1 FROM user_follows
                        WHERE follower_id = current_setting('app.current_user_id', true)::UUID
                        AND followee_id = dreams.user_id
                    )
                )
            )
        )
    );

CREATE POLICY dream_reactions_modify_policy ON dream_reactions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::UUID);

-- Follows policies
CREATE POLICY user_follows_view_policy ON user_follows
    FOR SELECT
    USING (
        follower_id = current_setting('app.current_user_id', true)::UUID
        OR followee_id = current_setting('app.current_user_id', true)::UUID
    );

CREATE POLICY user_follows_modify_policy ON user_follows
    FOR ALL
    USING (follower_id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (follower_id = current_setting('app.current_user_id', true)::UUID);

-- Notifications policies
CREATE POLICY user_notifications_view_policy ON user_notifications
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY user_notifications_modify_policy ON user_notifications
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

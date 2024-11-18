-- Indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Indexes for user_preferences
CREATE INDEX idx_user_preferences_notifications ON user_preferences USING GIN (notifications);
CREATE INDEX idx_user_preferences_privacy ON user_preferences USING GIN (privacy_settings);

-- Indexes for dreams table
CREATE INDEX idx_dreams_user_id_created_at ON dreams(user_id, created_at DESC);
CREATE INDEX idx_dreams_visibility ON dreams(visibility) WHERE visibility != 'private';
CREATE INDEX idx_dreams_tags ON dreams USING GIN (tags);
CREATE INDEX idx_dreams_search ON dreams USING GIN (search_vector);

-- Indexes for dream_analyses
CREATE INDEX idx_dream_analyses_dream_id ON dream_analyses(dream_id);
CREATE INDEX idx_dream_analyses_type ON dream_analyses(analysis_type);
CREATE INDEX idx_dream_analyses_content ON dream_analyses USING GIN (content);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Indexes for user_notifications
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id, created_at DESC);
CREATE INDEX idx_user_notifications_unread ON user_notifications(user_id) WHERE NOT read;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating search vectors
CREATE OR REPLACE FUNCTION dreams_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_old_data = to_jsonb(OLD);
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            details
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            TG_OP,
            TG_TABLE_NAME,
            OLD.id,
            jsonb_build_object(
                'old_data', v_old_data,
                'new_data', NULL
            )
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            details
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object(
                'old_data', v_old_data,
                'new_data', v_new_data,
                'changed_fields', (
                    SELECT jsonb_object_agg(key, value)
                    FROM jsonb_each(v_new_data)
                    WHERE v_new_data->key IS DISTINCT FROM v_old_data->key
                )
            )
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            details
        ) VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object(
                'old_data', NULL,
                'new_data', v_new_data
            )
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create timestamp update triggers
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_dreams_timestamp
    BEFORE UPDATE ON dreams
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_dream_analyses_timestamp
    BEFORE UPDATE ON dream_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create search vector update trigger
CREATE TRIGGER dreams_search_update
    BEFORE INSERT OR UPDATE ON dreams
    FOR EACH ROW
    EXECUTE FUNCTION dreams_search_trigger();

-- Create audit triggers
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_dreams_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dreams
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_dream_analyses_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dream_analyses
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

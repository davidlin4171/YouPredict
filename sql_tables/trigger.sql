USE `youtube_trending_data`;
CREATE TRIGGER before_insert_channel
BEFORE INSERT ON channel
FOR EACH ROW
BEGIN
    DECLARE db_channel_id VARCHAR(255);
    DECLARE new_channel_id VARCHAR(15);

    -- Check if the channel title already exists and fetch its channelId
    SELECT channelId INTO db_channel_id
    FROM channel
    WHERE channelTitle = NEW.channelTitle;

    -- If the channelTitle exists, use its channelId
    IF db_channel_id IS NOT NULL THEN
        SET NEW.channelId = db_channel_id;
    ELSE
        -- Generate a random string for channelId
        -- Note: The method of generation might vary based on your SQL system
        SET new_channel_id = CONCAT(SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                    SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1));
        SET NEW.channelId = new_channel_id;
    END IF;
END;

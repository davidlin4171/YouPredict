USE `youtube_trending_data`;
DROP TRIGGER IF EXISTS before_insert_channel;

DELIMITER $$
CREATE TRIGGER before_insert_channel
BEFORE INSERT ON channel
FOR EACH ROW
BEGIN
    DECLARE `db_channel_id` VARCHAR(255);
    DECLARE `new_channel_id` VARCHAR(15);

    -- Check if the channel title already exists and fetch its channelId
    SELECT `channel_id` INTO `db_channel_id`
    FROM `channel`
    WHERE `channel_title` = NEW.`channel_title`;

    -- If the channelTitle exists, use its channelId
    IF `db_channel_id` IS NOT NULL THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = "Channel_ID already exists";
    ELSE
        -- Generate a random string for channelId
        SET `new_channel_id` = CONCAT(SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1),
                                      SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', RAND() * 36 + 1, 1));
        SET NEW.`channel_id` = `new_channel_id`;
    END IF;
END$$

DELIMITER ;


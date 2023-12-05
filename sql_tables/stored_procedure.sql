USE `youtube_trending_data`;
CREATE PROCEDURE CalculateChannelStatistics()
BEGIN
    -- Check if the ChannelStatistics table exists; if not, create it
    CREATE TABLE IF NOT EXISTS ChannelStatistics (
        channel_id VARCHAR(255),
        channel_title VARCHAR(255),
        avgViews REAL,
        avgLikes REAL,
        avgComments REAL,
        PRIMARY KEY (channel_id)
    );

    -- Temporary variables to store averages
    DECLARE temp_avgViews REAL;
    DECLARE temp_avgLikes REAL;
    DECLARE temp_avgComments REAL;
    DECLARE done INT DEFAULT 0;
    DECLARE temp_channel_id VARCHAR(255);
    DECLARE temp_channel_title VARCHAR(255);

    -- Cursor to iterate through each channel
    DECLARE channelCursor CURSOR FOR
        SELECT c.channel_id, c.channel_title
        FROM channel c
        INNER JOIN video v ON c.channel_id = v.channel_id
        GROUP BY c.channel_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN channelCursor;
    REPEAT
        FETCH channelCursor INTO temp_channel_id, temp_channel_title;

        -- Calculate averages for each channel
        SELECT AVG(vs.view_count), AVG(vs.likes), AVG(vs.comment_count)
        INTO temp_avgViews, temp_avgLikes, temp_avgComments
        FROM video_stats vs
        INNER JOIN video v ON vs.video_id = v.video_id
        WHERE v.channel_id = temp_channel_id;

        -- Insert or update the ChannelStatistics table
        INSERT INTO ChannelStatistics(channel_id, channel_title, avgViews, avgLikes, avgComments)
        VALUES(temp_channel_id, temp_channel_title, temp_avgViews, temp_avgLikes, temp_avgComments)
        ON DUPLICATE KEY UPDATE
            avgViews = temp_avgViews,
            avgLikes = temp_avgLikes,
            avgComments = temp_avgComments;

    UNTIL done END REPEAT;
    CLOSE channelCursor;
END;

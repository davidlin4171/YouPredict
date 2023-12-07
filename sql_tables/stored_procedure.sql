USE `youtube_trending_data`;

DROP TABLE IF EXISTS ChannelStatistics;
DROP PROCEDURE IF EXISTS GetChannelStatistics;

DELIMITER //
CREATE PROCEDURE `GetChannelStatistics`()
BEGIN
    DECLARE `temp_avgViews` REAL;
    DECLARE `temp_avgLikes` REAL;
    DECLARE `temp_avgComments` REAL;
    DECLARE `temp_total_videos` INT;
    DECLARE `temp_max_view_count` BIGINT;
    DECLARE `done` INT DEFAULT 0;
    DECLARE `temp_channel_id` VARCHAR(255);
    DECLARE `temp_channel_title` VARCHAR(255);
    DECLARE `Current_Popularity_Level` INT;

    DECLARE `channelCursor` CURSOR FOR
        SELECT `c`.`channel_id`, `c`.`channel_title`
        FROM `channel` `c`
        INNER JOIN `video` `v` ON `c`.`channel_id` = `v`.`channel_id`
        GROUP BY `c`.`channel_id`;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET `done` = 1;
    CREATE TABLE IF NOT EXISTS `ChannelStatistics` (
        `channel_id` VARCHAR(255),
        `channel_title` VARCHAR(255),
        `avgViews` REAL,
        `avgLikes` REAL,
        `avgComments` REAL,
        `total_videos` INT,
        `max_view_count` BIGINT,
        `popularity_level` INT,
        PRIMARY KEY (`channel_id`)
    );

    OPEN `channelCursor`;
    REPEAT
        FETCH `channelCursor` INTO `temp_channel_id`, `temp_channel_title`;

        SELECT AVG(`vs`.`view_count`), AVG(`vs`.`likes`), AVG(`vs`.`comment_count`)
        INTO `temp_avgViews`, `temp_avgLikes`, `temp_avgComments`
        FROM `video_stats` `vs`
        INNER JOIN `video` `v` ON `vs`.`video_id` = `v`.`video_id`
        WHERE `v`.`channel_id` = `temp_channel_id`;

        SELECT COUNT(*)
        INTO `temp_total_videos`
        FROM `video`
        WHERE `channel_id` = `temp_channel_id`;

        SELECT MAX(`vs`.`view_count`)
        INTO `temp_max_view_count`
        FROM `video_stats` `vs`
        INNER JOIN `video` `v` ON `vs`.`video_id` = `v`.`video_id`
        WHERE `v`.`channel_id` = `temp_channel_id`;

        IF `temp_avgViews` > 0 AND `temp_avgViews` < 1000000 THEN  
            SET `Current_Popularity_Level` = 1;
        ELSEIF `temp_avgViews` >= 1000000 AND `temp_avgViews` < 3000000 THEN
            SET `Current_Popularity_Level` = 2;
        ELSE    
            SET `Current_Popularity_Level` = 3;
        END IF;

        INSERT INTO `ChannelStatistics`(`channel_id`, `channel_title`, `avgViews`, `avgLikes`, `avgComments`, `total_videos`, `max_view_count`, `popularity_level`)
        VALUES(`temp_channel_id`, `temp_channel_title`, `temp_avgViews`, `temp_avgLikes`, `temp_avgComments`, `temp_total_videos`, `temp_max_view_count`, `Current_Popularity_Level`)
        ON DUPLICATE KEY UPDATE
            `avgViews` = `temp_avgViews`,
            `avgLikes` = `temp_avgLikes`,
            `avgComments` = `temp_avgComments`,
            `total_videos` = `temp_total_videos`,
            `max_view_count` = `temp_max_view_count`,
            `popularity_level` = `Current_Popularity_Level`;

    UNTIL `done` END REPEAT;
    CLOSE `channelCursor`;
END//

DELIMITER ;

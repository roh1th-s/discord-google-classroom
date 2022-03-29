import config, { IConfig } from "../config";

import * as fs from "fs";
import * as path from "path";

import truncate from "../utils/truncate";
import { buildDate } from "../utils/timeUtils";

import {
  Client,
  EmbedField,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { IClassroom } from "./IClassroom";
import { classroom_v1 as ClassroomAPI } from "googleapis";
import { simpleEmbed } from "../utils/embedUtil";

const DB_PATH = path.join(__dirname, "../..", "db.json");

interface IMaterial {
  displayText: string;
}

interface IGoogleDriveMaterial extends IMaterial {
  id: string;
}

interface IGenericMaterial extends IMaterial {
  url: string;
}

interface IEmbedData {
  embed: MessageEmbed;
  files: IGoogleDriveMaterial[];
  youtube: IGenericMaterial[];
  links: IGenericMaterial[];
  forms: IGenericMaterial[];
}

interface IDatabase {
  announcements: ClassroomAPI.Schema$Announcement[];
  courseWork: ClassroomAPI.Schema$CourseWork[];
  courseWorkMaterial: ClassroomAPI.Schema$CourseWorkMaterial[];
}

interface IGenericEntry
  extends ClassroomAPI.Schema$Announcement,
    ClassroomAPI.Schema$CourseWork,
    ClassroomAPI.Schema$CourseWorkMaterial {}

const buildEmbed = <Entry extends IGenericEntry>(
  classroom: IClassroom,
  entry: Entry,
  isCourseWork: boolean = false
): IEmbedData => {
  const course = classroom.getCourseById(`${entry.courseId}`);

  // const title = course
  //   ? `New ${isCourseWork ? "classwork" : "post"} in "${course.name}"`
  //   : `New ${isCourseWork ? "classwork" : "post"} in classroom`;

  const title = isCourseWork
    ? entry.title || "[No title]"
    : course
    ? `New post in "${course.name}"`
    : `New post in classroom`;

  const description = isCourseWork
    ? entry.description
      ? truncate(entry.description, 2048)
      : "[classwork has no instructions]"
    : entry.text
    ? truncate(entry.text, 2048)
    : "[post has no text]";

  const url = `${entry.alternateLink}`;

  const files: IGoogleDriveMaterial[] = [];
  const youtube: IGenericMaterial[] = [];
  const links: IGenericMaterial[] = [];
  const forms: IGenericMaterial[] = [];

  if (entry.materials) {
    entry.materials.forEach((material) => {
      if (material.driveFile) {
        const {
          driveFile: { driveFile },
        } = material;
        driveFile &&
          files.push({
            id: `${driveFile.id}`,
            displayText: `[${driveFile.title}](${driveFile.alternateLink})`,
          });
      }

      if (material.youtubeVideo) {
        const { youtubeVideo } = material;
        youtubeVideo &&
          youtube.push({
            url: `${youtubeVideo.alternateLink}`,
            displayText: `[${youtubeVideo.title}](${youtubeVideo.alternateLink})`,
          });
      }

      if (material.link) {
        const { link } = material;
        link &&
          links.push({
            url: `${link.url}`,
            displayText: `[${link.title}](${link.url})`,
          });
      }

      if (material.form) {
        const { form } = material;
        form &&
          forms.push({
            url: `${form.formUrl}`,
            displayText: `[${form.title}](${form.formUrl})`,
          });
      }
    });
  }

  const fields: EmbedField[] = [];

  fields.push({
    name: "Created at:",
    value: new Date(`${entry.creationTime}`).toUTCString(),
    inline: false,
    // why is inline a required parameter, it's almost never mentioned in the
    // examples
  });

  if (entry.dueDate && entry.dueTime) {
    const { year, month, day } = entry.dueDate;
    const { hours, minutes } = entry.dueTime;
    const dueDate = buildDate({ year, month, day, hours, minutes });

    fields.push({
      name: "Assignment due date:",
      value: dueDate.toUTCString(),
      inline: true,
    });
  }

  if (entry.workType) {
    fields.push({
      name: "Classwork type:",
      value: entry.workType,
      inline: true,
    });
  }

  if (entry.maxPoints) {
    fields.push({
      name: "Max points:",
      value: `${entry.maxPoints}`,
      inline: true,
    });
  }

  if (files.length) {
    fields.push({
      name: "Attached Google Drive files:",
      value: files.map((m) => m.displayText).join(", "),
      inline: true,
    });
  }

  if (youtube.length) {
    fields.push({
      name: "Attached YouTube videos:",
      value: youtube.map((y) => y.displayText).join(", "),
      inline: true,
    });
  }

  if (links.length) {
    fields.push({
      name: "Attached links:",
      value: links.map((l) => l.displayText).join(", "),
      inline: true,
    });
  }

  if (forms.length) {
    fields.push({
      name: "Attached forms:",
      value: forms.map((f) => f.displayText).join(", "),
      inline: true,
    });
  }

  const embed = simpleEmbed(title, description);
  embed.setURL(url);
  embed.addFields(fields);

  return {
    embed,
    files,
    youtube,
    links,
    forms,
  };
};

const updateDB = (
  announcements: ClassroomAPI.Schema$Announcement[] | null,
  courseWork: ClassroomAPI.Schema$CourseWork[] | null,
  courseWorkMaterial: ClassroomAPI.Schema$CourseWorkMaterial[] | null
) => {
  announcements = announcements || [];
  courseWork = courseWork || [];
  courseWorkMaterial = courseWorkMaterial || [];

  fs.writeFileSync(
    DB_PATH,
    JSON.stringify({
      announcements: announcements.map((a) => {
        return {
          id: a.id,
          courseId: a.courseId,
          creationTime: a.creationTime,
        };
      }),
      courseWork: courseWork.map((cw) => {
        return {
          id: cw.id,
          courseId: cw.courseId,
          creationTime: cw.creationTime,
        };
      }),
      courseWorkMaterial: courseWorkMaterial.map((cwm) => {
        return {
          id: cwm.id,
          courseId: cwm.courseId,
          creationTime: cwm.creationTime,
        };
      }),
    }),
    { encoding: "utf8" }
  );
};

const sendAttachments = async (
  classroom: IClassroom,
  channel: TextChannel,
  { files, youtube, links, forms }: IEmbedData
) => {
  if (
    files.length &&
    config.google.scopes.includes(
      "https://www.googleapis.com/auth/drive.readonly"
    )
  ) {
    for (const file of files) {
      const fileData = await classroom.getFile(file.id);

      if (fileData) {
        await channel.send(
          new MessageAttachment(fileData.buffer, fileData.title)
        );
      }
    }
  }

  if (youtube.length) {
    for (const video of youtube) {
      await channel.send(video.url);
    }
  }

  /* if (links.length) {
    for (const link of links) {
      await channel.send(link.url);
    }
  } */

  /* if (forms.length) {
    for (const form of forms) {
      await channel.send(form.url);
    }
  } */
};

const sendUpdate = async (
  bot: Client,
  classroom: IClassroom,
  announcements: ClassroomAPI.Schema$Announcement[],
  courseWorks: ClassroomAPI.Schema$CourseWork[],
  courseWorkMaterial: ClassroomAPI.Schema$CourseWorkMaterial[],
  config: IConfig
) => {
  if (
    !announcements.length &&
    !courseWorks.length &&
    !courseWorkMaterial.length
  ) {
    return;
  }

  const channel = bot.channels.cache.get(config.bot.channel) as TextChannel;

  for (const entry of announcements) {
    const { embed, files, youtube, links, forms } =
      buildEmbed<ClassroomAPI.Schema$Announcement>(classroom, entry);

    if (channel) {
      await channel.send({
        content: `${
          config.bot.pingRole ? `<@&${config.bot.pingRole}>` : ""
        } **New update in your class on Google Classroom!**`,
        embed,
      });

      await sendAttachments(classroom, channel, {
        embed,
        files,
        youtube,
        links,
        forms,
      });
    }
  }

  for (const entry of courseWorkMaterial) {
    const { embed, files, youtube, links, forms } =
      buildEmbed<ClassroomAPI.Schema$CourseWorkMaterial>(
        classroom,
        entry,
        true
      );

    if (channel) {
      await channel.send({
        content: `${
          config.bot.pingRole ? `<@&${config.bot.pingRole}>` : ""
        } **New classwork material on Google Classroom!**`,
        embed,
      });

      await sendAttachments(classroom, channel, {
        embed,
        files,
        youtube,
        links,
        forms,
      });
    }
  }
  for (const entry of courseWorks) {
    const { embed, files, youtube, links, forms } =
      buildEmbed<ClassroomAPI.Schema$CourseWork>(classroom, entry, true);

    if (channel) {
      await channel.send({
        content: `${
          config.bot.pingRole ? `<@&${config.bot.pingRole}>` : ""
        } **New classwork on Google Classroom!**`,
        embed,
      });

      await sendAttachments(classroom, channel, {
        embed,
        files,
        youtube,
        links,
        forms,
      });
    }
  }
};

const firstIsNewer = (
  an1: ClassroomAPI.Schema$Announcement | ClassroomAPI.Schema$CourseWork | null,
  an2: ClassroomAPI.Schema$Announcement | ClassroomAPI.Schema$CourseWork | null
): boolean => {
  if (!(an1 || an2)) return false;

  if (an1 && !an2) return true;

  if (!an1 && an2) return false;

  const date1 = new Date(an1!.creationTime!).getTime();
  const date2 = new Date(an2!.creationTime!).getTime();

  return date1 > date2;
};

const check = async (
  bot: Client,
  classroom: IClassroom,
  config: IConfig,
  noOfPolls: number
) => {
  const announcements = await classroom.listAnnouncements();
  let courseWork: ClassroomAPI.Schema$CourseWork[] = [];
  let courseWorkMaterial: ClassroomAPI.Schema$CourseWorkMaterial[] = [];

  if (
    config.google.scopes.includes(
      "https://www.googleapis.com/auth/classroom.coursework.me.readonly"
    )
  ) {
    courseWork = await classroom.listCourseWork();
  }

  if (
    config.google.scopes.includes(
      "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly"
    )
  ) {
    courseWorkMaterial = await classroom.listCourseWorkMaterial();
  }

  const latestFetchedAnnouncement = announcements[announcements.length - 1];
  const latestFetchedCourseWork = courseWork[courseWork.length - 1];
  const latestFetchedCourseWorkMaterial =
    courseWorkMaterial[courseWorkMaterial.length - 1];

  if (!fs.existsSync(DB_PATH)) {
    //sendUpdate(bot, classroom, announcements, courseWork);
    updateDB(
      latestFetchedAnnouncement ? [latestFetchedAnnouncement] : null,
      latestFetchedCourseWork ? [latestFetchedCourseWork] : null,
      latestFetchedCourseWorkMaterial ? [latestFetchedCourseWorkMaterial] : null
    );
    return;
  }

  //if neither of them exist
  if (
    !(
      latestFetchedAnnouncement ||
      latestFetchedCourseWork ||
      latestFetchedCourseWorkMaterial
    )
  )
    return;

  const raw = fs.readFileSync(DB_PATH, { encoding: "utf8" });
  let json: IDatabase;

  try {
    let parsed = JSON.parse(raw);
    
    if (Object.keys(parsed).length == 0)
      json = { announcements: [], courseWork: [], courseWorkMaterial: [] };
    else 
      json = parsed;
      
  } catch (err) {
    console.error(err);
    json = { announcements: [], courseWork: [], courseWorkMaterial: [] };
  }
  if (
    !json.announcements.length &&
    !json.courseWork.length &&
    !json.courseWorkMaterial.length
  ) {
    updateDB(
      latestFetchedAnnouncement ? [latestFetchedAnnouncement] : null,
      latestFetchedCourseWork ? [latestFetchedCourseWork] : null,
      latestFetchedCourseWorkMaterial ? [latestFetchedCourseWorkMaterial] : null
    );
    return;
  }

  let newAnnouncements: ClassroomAPI.Schema$Announcement[] = [];
  let newCourseWork: ClassroomAPI.Schema$CourseWork[] = [];
  let newCourseWorkMaterial: ClassroomAPI.Schema$CourseWorkMaterial[] = [];

  json.announcements = json.announcements || [];
  json.courseWork = json.courseWork || [];
  json.courseWorkMaterial = json.courseWorkMaterial || [];

  newAnnouncements = json.announcements.length
    ? announcements.filter((a) => {
        return firstIsNewer(a, json.announcements[0]);
      })
    : announcements;

  newCourseWork = json.courseWork.length
    ? courseWork.filter((a) => {
        return firstIsNewer(a, json.courseWork[0]);
      })
    : courseWork;

  newCourseWorkMaterial = json.courseWorkMaterial.length
    ? courseWorkMaterial.filter((a) => {
        return firstIsNewer(a, json.courseWorkMaterial[0]);
      })
    : courseWorkMaterial;

  //newCourseWork = differenceBy(courseWork, json.courseWork, "id");

  if (
    newAnnouncements.length ||
    newCourseWork.length ||
    newCourseWorkMaterial.length
  ) {
    sendUpdate(
      bot,
      classroom,
      newAnnouncements,
      newCourseWork,
      newCourseWorkMaterial,
      config
    );
    updateDB(
      latestFetchedAnnouncement
        ? [latestFetchedAnnouncement]
        : json.announcements,
      latestFetchedCourseWork ? [latestFetchedCourseWork] : json.courseWork,
      latestFetchedCourseWorkMaterial
        ? [latestFetchedCourseWorkMaterial]
        : json.courseWorkMaterial
    );
  }

  if (noOfPolls != 0 && process.stdout.clearLine) {
    try {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`Polled api (x${noOfPolls})`);
    } catch (err) {
      console.error(err);
      console.log("Polled api.");
    }
  } else {
    console.log("Polled api.");
  }
};

export default check;

import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { env } from './env';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Post } from '../entities/Post';
import { PostView } from '../entities/PostView';
import { Comment } from '../entities/Comment';
import { Subject } from '../entities/Subject';

import { InitialSchema1781745332530 } from '../migrations/1781745332530-InitialSchema';
import { PostEPostView1781746779920 } from '../migrations/1781746779920-PostEPostView';
import { AddSubjects1786667649646 } from '../migrations/1786667649646-AddSubjects';
import { CascadePostsOnUserDelete1786576866089 } from '../migrations/1786576866089-CascadePostsOnUserDelete';
import { CleanupOrphanPostsAfterUserDelete1786758093339 } from '../migrations/1786758093339-CleanupOrphanPostsAfterUserDelete';
import { AddImageToUsers1786762021684 } from '../migrations/1786762021684-AddImageToUsers';
import { CreateCommentTable1787064394494 } from '../migrations/1787064394494-CreateCommentTable';
import { AddBirthDateToUsers1787612400000 } from '../migrations/1787612400000-AddBirthDateToUsers';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  synchronize: false,
  logging: false,
  entities: [Role, User, Post, PostView, Subject, Comment],
  migrations: [
    InitialSchema1781745332530,
    PostEPostView1781746779920,
    CascadePostsOnUserDelete1786576866089,
    CleanupOrphanPostsAfterUserDelete1786758093339,
    AddSubjects1786667649646,
    AddImageToUsers1786762021684,
    CreateCommentTable1787064394494,
    AddBirthDateToUsers1787612400000,
  ],
  ssl: env.isProduction ? { rejectUnauthorized: true } : false,
});

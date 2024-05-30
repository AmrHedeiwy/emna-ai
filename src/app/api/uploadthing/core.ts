import { indexFile } from '@/lib/pinecone';
import prisma from '@/lib/prismadb';

import authOptions from '@/server/authOptions';
import { getServerSession } from 'next-auth';

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(async ({}) => {
      const session = await getServerSession(authOptions);

      if (!session || !session.user.id) throw new UploadThingError('Unauthorized');

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isFileExist = !!(await prisma.file.findFirst({ where: { key: file.key } }));

      if (isFileExist) return;

      const createdFile = await prisma.file.create({
        data: {
          url: file.url,
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          uploadStatus: 'PROCESSING'
        }
      });

      try {
        await indexFile(createdFile.url, createdFile.id);

        await prisma.file.update({
          where: { id: createdFile.id },
          data: { uploadStatus: 'SUCCESS' }
        });
      } catch (error) {
        console.log(error);
        if (
          error instanceof UploadThingError &&
          (error.code === 'UPLOAD_FAILED' ||
            error.code === 'INTERNAL_CLIENT_ERROR' ||
            error.code === 'INTERNAL_SERVER_ERROR' ||
            error.code === 'URL_GENERATION_FAILED')
        )
          console.error(error);

        await prisma.file.update({
          where: {
            id: createdFile.id
          },
          data: {
            uploadStatus: 'FAILED'
          }
        });
      }
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

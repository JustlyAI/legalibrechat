import { useEffect } from 'react';
import { EToolResources } from 'legallibrechat-data-provider';
import type { ExtendedFile } from '~/common';
import { useDeleteFilesMutation } from '~/data-provider';
import { useFileDeletion } from '~/hooks/Files';
import FileContainer from './FileContainer';
import Image from './Image';

export default function FileRow({
  files: _files,
  setFiles,
  setFilesLoading,
  assistant_id,
  tool_resource,
  fileFilter,
  Wrapper,
}: {
  files: Map<string, ExtendedFile>;
  setFiles: React.Dispatch<React.SetStateAction<Map<string, ExtendedFile>>>;
  setFilesLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fileFilter?: (file: ExtendedFile) => boolean;
  assistant_id?: string;
  tool_resource?: EToolResources;
  Wrapper?: React.FC<{ children: React.ReactNode }>;
}) {
  const files = Array.from(_files.values()).filter((file) =>
    fileFilter ? fileFilter(file) : true,
  );

  const { mutateAsync } = useDeleteFilesMutation({
    onMutate: async () =>
      console.log('Deleting files: assistant_id, tool_resource', assistant_id, tool_resource),
    onSuccess: () => {
      console.log('Files deleted');
    },
    onError: (error) => {
      console.log('Error deleting files:', error);
    },
  });

  const { deleteFile } = useFileDeletion({ mutateAsync, assistant_id, tool_resource });

  useEffect(() => {
    if (!files) {
      return;
    }

    if (files.length === 0) {
      return;
    }

    if (files.some((file) => file.progress < 1)) {
      return;
    }

    if (files.every((file) => file.progress === 1)) {
      setFilesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  const renderFiles = () => {
    return (
      <>
        {files
          .reduce(
            (acc, current) => {
              if (!acc.map.has(current.file_id)) {
                acc.map.set(current.file_id, true);
                acc.uniqueFiles.push(current);
              }
              return acc;
            },
            { map: new Map(), uniqueFiles: [] as ExtendedFile[] },
          )
          .uniqueFiles.map((file: ExtendedFile, index: number) => {
            const handleDelete = () => deleteFile({ file, setFiles });
            if (file.type?.startsWith('image')) {
              return (
                <Image
                  key={index}
                  url={file.preview || file.filepath}
                  onDelete={handleDelete}
                  progress={file.progress}
                  source={file.source}
                />
              );
            }

            return <FileContainer key={index} file={file} onDelete={handleDelete} />;
          })}
      </>
    );
  };

  if (Wrapper) {
    return <Wrapper>{renderFiles()}</Wrapper>;
  }

  return renderFiles();
}

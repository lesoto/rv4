import {
  ContentCopy,
  DeleteOutline,
  DriveFileRenameOutline,
  Link as LinkIcon,
  MoreVert,
  OpenInNew,
} from '@mui/icons-material';
import { ButtonBase, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { Website } from '@reactive-website/schema';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import { WEBSITE_QUERY } from '@/constants/index';
import { ServerError } from '@/services/axios';
import queryClient from '@/services/react-query';
import { deleteWebsite, DeleteWebsiteParams, duplicateWebsite, DuplicateWebsiteParams } from '@/services/website';
import { useAppDispatch } from '@/store/hooks';
import { setModalState } from '@/store/modal/modalSlice';
import { getRelativeTime } from '@/utils/date';
import getWebsiteUrl from '@/utils/getWebsiteUrl';

import styles from './WebsitePreview.module.scss';

type Props = {
  website: Website;
};

const WebsitePreview: React.FC<Props> = ({ website }) => {
  const router = useRouter();

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const { mutateAsync: duplicateMutation } = useMutation<Website, ServerError, DuplicateWebsiteParams>(
    duplicateWebsite
  );

  const { mutateAsync: deleteMutation } = useMutation<void, ServerError, DeleteWebsiteParams>(deleteWebsite);

  const handleOpen = () => {
    handleClose();

    router.push({
      pathname: '/[username]/[slug]/build',
      query: { username: website.user.username, slug: website.slug },
    });
  };

  const handleOpenMenu = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    handleClose();

    dispatch(
      setModalState({
        modal: 'dashboard.rename-website',
        state: {
          open: true,
          payload: {
            item: website,
            onComplete: () => {
              queryClient.invalidateQueries(WEBSITE_QUERY);
            },
          },
        },
      })
    );
  };

  const handleDuplicate = async () => {
    handleClose();

    await duplicateMutation({ id: website.id });

    queryClient.invalidateQueries(WEBSITE_QUERY);
  };

  const handleShareLink = async () => {
    handleClose();

    const url = getWebsiteUrl(website, { withHost: true });
    await navigator.clipboard.writeText(url);

    toast.success(t<string>('common.toast.success.website-link-copied'));
  };

  const handleDelete = async () => {
    handleClose();

    await deleteMutation({ id: website.id });

    queryClient.invalidateQueries(WEBSITE_QUERY);
  };

  return (
    <section className={styles.website}>
      <Link
        passHref
        href={{
          pathname: '/[username]/[slug]/build',
          query: { username: website.user.username, slug: website.slug },
        }}
      >
        <ButtonBase className={styles.preview}>
          {website.image ? (
            <Image src={website.image} alt={website.name} objectFit="cover" layout="fill" priority />
          ) : null}
        </ButtonBase>
      </Link>

      <footer>
        <div className={styles.meta}>
          <p>{website.name}</p>
          <p>{t<string>('dashboard.website.timestamp', { timestamp: getRelativeTime(website.updatedAt) })}</p>
        </div>

        <ButtonBase className={styles.menu} onClick={handleOpenMenu}>
          <MoreVert />
        </ButtonBase>

        <Menu anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
          <MenuItem onClick={handleOpen}>
            <ListItemIcon>
              <OpenInNew className="scale-90" />
            </ListItemIcon>
            <ListItemText>{t<string>('dashboard.website.menu.open')}</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleRename}>
            <ListItemIcon>
              <DriveFileRenameOutline className="scale-90" />
            </ListItemIcon>
            <ListItemText>{t<string>('dashboard.website.menu.rename')}</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon>
              <ContentCopy className="scale-90" />
            </ListItemIcon>
            <ListItemText>{t<string>('dashboard.website.menu.duplicate')}</ListItemText>
          </MenuItem>

          {website.public ? (
            <MenuItem onClick={handleShareLink}>
              <ListItemIcon>
                <LinkIcon className="scale-90" />
              </ListItemIcon>
              <ListItemText>{t<string>('dashboard.website.menu.share-link')}</ListItemText>
            </MenuItem>
          ) : (
            <Tooltip arrow placement="right" title={t<string>('dashboard.website.menu.tooltips.share-link')}>
              <div>
                <MenuItem>
                  <ListItemIcon>
                    <LinkIcon className="scale-90" />
                  </ListItemIcon>
                  <ListItemText>{t<string>('dashboard.website.menu.share-link')}</ListItemText>
                </MenuItem>
              </div>
            </Tooltip>
          )}

          <Tooltip arrow placement="right" title={t<string>('dashboard.website.menu.tooltips.delete')}>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteOutline className="scale-90" />
              </ListItemIcon>
              <ListItemText>{t<string>('dashboard.website.menu.delete')}</ListItemText>
            </MenuItem>
          </Tooltip>
        </Menu>
      </footer>
    </section>
  );
};

export default WebsitePreview;

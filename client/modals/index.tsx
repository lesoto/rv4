import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { ModalName, setModalState } from '@/store/modal/modalSlice';

import ForgotPasswordModal from './auth/ForgotPasswordModal';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import ResetPasswordModal from './auth/ResetPasswordModal';
import BlogModal from './builder/sections/BlogModal';
import CTAModal from './builder/sections/CTAModal';
import CustomModal from './builder/sections/CustomModal';
import EducationModal from './builder/sections/EducationModal';
import InterestModal from './builder/sections/InterestModal';
import LanguageModal from './builder/sections/LanguageModal';
import ProfileModal from './builder/sections/ProfileModal';
import ProjectModal from './builder/sections/ProjectModal';
import PublicationModal from './builder/sections/PublicationModal';
import FooterModal from './builder/sections/FooterModal';
import SkillModal from './builder/sections/SkillModal';
import VolunteerModal from './builder/sections/VolunteerModal';
import TeamModal from './builder/sections/TeamModal';
import CreateWebsiteModal from './dashboard/CreateWebsiteModal';
import ImportExternalModal from './dashboard/ImportExternalModal';
import RenameWebsiteModal from './dashboard/RenameWebsiteModal';

type QueryParams = {
  modal?: ModalName;
};

const ModalWrapper: React.FC = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const { modal, ...rest } = router.query as QueryParams;

    if (!modal) return;

    dispatch(setModalState({ modal, state: { open: true, payload: { item: rest } } }));
  }, [router.query, dispatch]);

  return (
    <>
      {/* Authentication */}
      <LoginModal />
      <RegisterModal />
      <ForgotPasswordModal />
      <ResetPasswordModal />

      {/* Dashboard */}
      <CreateWebsiteModal />
      <ImportExternalModal />
      <RenameWebsiteModal />

      {/* Builder */}

      {/* Sections */}
      <ProfileModal />
      <TeamModal />
      <EducationModal />
      <BlogModal />
      <CTAModal />
      <PublicationModal />
      <SkillModal />
      <LanguageModal />
      <InterestModal />
      <VolunteerModal />
      <ProjectModal />
      <FooterModal />

      {/* Custom Sections */}
      <CustomModal />
    </>
  );
};

export default ModalWrapper;

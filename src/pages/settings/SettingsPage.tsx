import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Segmented, App } from 'antd';
import i18n from 'i18next';
import { updateUserProfile, changeUserPassword } from '@/api/users';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import type { Theme, Language } from '@/store/useThemeStore';

interface ProfileForm {
  username: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const showConfirm = useConfirm();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const remember = useAuthStore((s) => s.remember);
  const theme = useThemeStore((s) => s.theme);
  const language = useThemeStore((s) => s.language);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setLanguage = useThemeStore((s) => s.setLanguage);

  const [profileForm] = Form.useForm<ProfileForm>();
  const [passwordForm] = Form.useForm<PasswordForm>();

  const handleSaveProfile = async (values: ProfileForm) => {
    if (!user) return;
    try {
      const res = await updateUserProfile({ username: values.username });
      setAuth(token!, res.data, remember);
      void message.success(t('settings.profile.saveSuccess'));
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleSavePassword = async (values: PasswordForm) => {
    if (!user) return;
    try {
      await changeUserPassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
      });
      passwordForm.resetFields();
      void message.success(t('settings.security.saveSuccess'));
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleThemeChange = (val: string | number) => {
    setTheme(val as Theme);
    document.documentElement.setAttribute('data-theme', val as string);
  };

  const handleLanguageChange = (val: string | number) => {
    setLanguage(val as Language);
    void i18n.changeLanguage(val as string);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="card card-mb">
        <div className="card-head">
          <span className="card-title">{t('settings.profile.title')}</span>
          <span className="card-sub">{t('settings.profile.description')}</span>
        </div>
        <div className="card-body card-body-narrow">
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{ username: user?.username ?? '' }}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={t('settings.profile.username')}
              rules={[
                { required: true, message: t('common.required') },
                { min: 3, message: t('auth.validation.usernameMin', 'En az 3 karakter') },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item className="mb-16">
              <Button
                type="primary"
                onClick={() =>
                  void profileForm.validateFields()
                    .then((values) =>
                      showConfirm({
                        title: t('settings.profile.saveTitle'),
                        content: t('settings.profile.saveConfirm'),
                        okText: t('common.save'),
                        cancelText: t('common.cancel'),
                        onConfirm: () => handleSaveProfile(values),
                      })
                    )
                    .catch(() => {})
                }
              >
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="card card-mb">
        <div className="card-head">
          <span className="card-title">{t('settings.security.title')}</span>
          <span className="card-sub">{t('settings.security.description')}</span>
        </div>
        <div className="card-body card-body-narrow">
          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="currentPassword"
              label={t('settings.security.currentPassword')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label={t('settings.security.newPassword')}
              rules={[
                { required: true, message: t('common.required') },
                { min: 6, message: t('auth.validation.passwordMin', 'En az 6 karakter') },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={t('settings.security.confirmPassword')}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('common.required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.validation.passwordMismatch')));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item className="mb-16">
              <Button
                type="primary"
                onClick={() =>
                  void passwordForm.validateFields()
                    .then((values) =>
                      showConfirm({
                        title: t('settings.security.saveTitle'),
                        content: t('settings.security.saveConfirm'),
                        okText: t('common.save'),
                        cancelText: t('common.cancel'),
                        onConfirm: () => handleSavePassword(values),
                      })
                    )
                    .catch(() => {})
                }
              >
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('settings.preferences.title')}</span>
          <span className="card-sub">{t('settings.preferences.description')}</span>
        </div>
        <div className="card-body pref-col">
          <div>
            <div className="pref-label">{t('settings.preferences.defaultTheme')}</div>
            <Segmented
              value={theme}
              onChange={handleThemeChange}
              options={[
                { label: t('settings.preferences.themeLight'), value: 'light' },
                { label: t('settings.preferences.themeDark'), value: 'dark' },
              ]}
            />
          </div>
          <div>
            <div className="pref-label">{t('settings.preferences.defaultLanguage')}</div>
            <Segmented
              value={language}
              onChange={handleLanguageChange}
              options={[
                { label: 'Türkçe', value: 'tr' },
                { label: 'English', value: 'en' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

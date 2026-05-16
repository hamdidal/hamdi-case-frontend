import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Segmented, App } from 'antd';
import i18n from 'i18next';
import { updateUserProfile, changeUserPassword } from '@/api/users';
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
  const { user, setAuth, token } = useAuthStore();
  const { theme, language, setTheme, setLanguage } = useThemeStore();

  const [profileForm] = Form.useForm<ProfileForm>();
  const [passwordForm] = Form.useForm<PasswordForm>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (values: ProfileForm) => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await updateUserProfile(user.id, { username: values.username });
      setAuth(token!, res.data);
      void message.success(t('settings.profile.saveSuccess'));
    } catch {
      void message.error(t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (values: PasswordForm) => {
    if (!user) return;
    setSavingPassword(true);
    try {
      await changeUserPassword(user.id, {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      });
      passwordForm.resetFields();
      void message.success(t('settings.security.saveSuccess'));
    } catch {
      void message.error(t('common.error'));
    } finally {
      setSavingPassword(false);
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

      {/* Profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <span className="card-title">{t('settings.profile.title')}</span>
          <span className="card-sub">{t('settings.profile.description')}</span>
        </div>
        <div className="card-body" style={{ maxWidth: 400 }}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleSaveProfile}
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
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={savingProfile}>
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Security */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <span className="card-title">{t('settings.security.title')}</span>
          <span className="card-sub">{t('settings.security.description')}</span>
        </div>
        <div className="card-body" style={{ maxWidth: 400 }}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleSavePassword}
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
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={savingPassword}>
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('settings.preferences.title')}</span>
          <span className="card-sub">{t('settings.preferences.description')}</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>
              {t('settings.preferences.defaultTheme')}
            </div>
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
            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>
              {t('settings.preferences.defaultLanguage')}
            </div>
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

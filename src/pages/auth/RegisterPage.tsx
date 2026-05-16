import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Alert, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { register } from '@/api/auth';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

function AuthPoster() {
  const { t } = useTranslation();
  const title: string = t('auth.posterTitle', 'Şeffaf bir tekstil için dijital pasaport.');
  const words = title.split(' ');
  const lastWord = words.pop();
  const rest = words.join(' ');
  return (
    <div className="auth-poster">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="side-brand-mark" style={{ width: 32, height: 32 }} />
        <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>Kobe</div>
      </div>
      <div className="poster-mark">
        {rest} <em>{lastWord}</em>
      </div>
      <div className="poster-foot">{t('auth.posterFoot', 'Kobe · DPP YÖNETİM PANELİ')}</div>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await register(values.username, values.password);
      void message.success(t('auth.registerSuccess'));
      navigate('/login', { replace: true });
    } catch {
      setError(t('errors.serverError', 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthPoster />

      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1 className="auth-title">{t('auth.createTitle')}</h1>
          <p className="auth-sub">{t('auth.createSub', 'Şirketiniz için yeni bir DPP yöneticisi ekleyin')}</p>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                { required: true, message: t('errors.required') },
                { min: 3, message: t('auth.validation.usernameMin', 'En az 3 karakter olmalıdır') },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder={t('auth.usernamePlaceholder', 'Kullanıcı adı')}
                size="large"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[
                { required: true, message: t('errors.required') },
                { min: 6, message: t('auth.validation.passwordMin', 'En az 6 karakter olmalıdır') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder={t('auth.passwordPlaceholder', 'Şifre')}
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              dependencies={['password']}
              rules={[
                { required: true, message: t('errors.required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.validation.passwordMismatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder={t('auth.confirmPasswordPlaceholder', 'Şifreyi tekrar girin')}
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
              >
                {t('auth.signup')}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('auth.toSignin')}</span>
            <a
              onClick={() => navigate('/login')}
              style={{ cursor: 'pointer', color: 'var(--brand-600)', fontWeight: 500, fontSize: 13 }}
            >
              {t('auth.signinCta')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

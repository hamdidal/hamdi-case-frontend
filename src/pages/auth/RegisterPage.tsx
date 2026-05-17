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
      <div className="side-brand">
        <div className="side-brand-mark" />
        <div className="side-brand-text">
          Kobe
          <small>DPP MANAGEMENT</small>
        </div>
      </div>
      <div className="poster-mark">
        {rest} <em>{lastWord}</em>
      </div>
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
              className="auth-alert"
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
                prefix={<UserOutlined />}
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
                prefix={<LockOutlined />}
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
                prefix={<LockOutlined />}
                placeholder={t('auth.confirmPasswordPlaceholder', 'Şifreyi tekrar girin')}
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item className="form-item-mb">
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

          <div className="auth-alt-row">
            <span>{t('auth.toSignin')}</span>
            <a className="auth-link" onClick={() => navigate('/login')}>
              {t('auth.signinCta')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Checkbox, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

function decodeJwt(token: string): Partial<User> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? payload.id ?? 0,
      username: payload.username ?? payload.sub ?? '',
      role: payload.role ?? 'auditor',
      createdAt: payload.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return { id: 0, username: '', role: 'auditor', createdAt: new Date().toISOString() };
  }
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

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = await login(values.username, values.password);
      const { token } = res.data;
      const rawUser = res.data.user as User | null | undefined;
      const user: User = rawUser ?? ({ ...decodeJwt(token), username: values.username } as User);
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthPoster />

      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1 className="auth-title">{t('auth.welcome')}</h1>
          <p className="auth-sub">{t('auth.welcomeSub', 'Pasaport panelinize erişmek için giriş yapın')}</p>
          
          <Alert
            type="error"
            title={error ?? ''}
            showIcon
            className="auth-alert"
            style={error ? undefined : { display: 'none' }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ remember: true }}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[{ required: true, message: t('errors.required') }]}
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
              rules={[{ required: true, message: t('errors.required') }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.passwordPlaceholder', 'Şifre')}
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>

            <Form.Item className="form-item-mb">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
              >
                {t('auth.signin')}
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-alt-row">
            <span>{t('auth.toSignup')}</span>
            <a className="auth-link" onClick={() => navigate('/register')}>
              {t('auth.signupCta')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

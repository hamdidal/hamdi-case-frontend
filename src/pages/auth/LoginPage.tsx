import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Checkbox, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';
import { decodeJwt } from '@/utils/auth';
import AuthLayout from '@/components/auth/AuthLayout';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
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
    <AuthLayout>
      <h1 className="auth-title">{t('auth.welcome')}</h1>
      <p className="auth-sub">{t('auth.welcomeSub')}</p>

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
    </AuthLayout>
  );
}

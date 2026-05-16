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
      {/* Left poster */}
      <div className="auth-poster">
        <div className="auth-poster-brand">
          <div className="auth-poster-mark" />
          <div>
            <div className="auth-poster-title">VeriPass</div>
            <div className="auth-poster-sub">DPP Panel</div>
          </div>
        </div>
        <div className="auth-poster-body">
          <div className="auth-poster-headline">
            {t('auth.posterHeadline', 'Tekstil ürünlerinizin\ndijital pasaportu')}
          </div>
          <div className="auth-poster-caption">
            {t('auth.posterCaption', 'Sürdürülebilirlik verilerini yönetin, QR kodlar oluşturun ve ürün geçmişini takip edin.')}
          </div>
          <div className="auth-poster-dots">
            <div className="auth-poster-dot active" />
            <div className="auth-poster-dot" />
            <div className="auth-poster-dot" />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-title">{t('auth.welcome')}</div>
          <div className="auth-sub">{t('auth.loginSubtitle', 'Hesabınıza giriş yapın')}</div>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 20 }}
            />
          )}

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
              rules={[{ required: true, message: t('errors.required') }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder={t('auth.passwordPlaceholder', 'Şifre')}
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
              >
                {t('auth.login')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

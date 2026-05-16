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
          <div className="auth-title">{t('auth.createAccount', 'Hesap Oluştur')}</div>
          <div className="auth-sub">{t('auth.registerSubtitle', 'Yeni bir hesap oluşturun')}</div>

          {error && (
            <Alert
              type="error"
              title={error}
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

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
              >
                {t('auth.register')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Alert, App } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { register } from '@/api/auth';
import AuthLayout from '@/components/auth/AuthLayout';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

interface PasswordRule {
  key: string;
  label: string;
  test: (v: string) => boolean;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');

  const passwordRules: PasswordRule[] = [
    { key: 'min', label: t('auth.validation.passwordMin'), test: (v) => v.length >= 8 },
    { key: 'max', label: t('auth.validation.passwordMax'), test: (v) => v.length <= 72 },
    { key: 'upper', label: t('auth.validation.passwordUppercase'), test: (v) => /[A-Z]/.test(v) },
    { key: 'number', label: t('auth.validation.passwordNumber'), test: (v) => /[0-9]/.test(v) },
    { key: 'special', label: t('auth.validation.passwordSpecial'), test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const handleSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await register(values.username, values.password);
      void message.success(t('auth.registerSuccess'));
      navigate('/login', { replace: true });
    } catch {
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-title">{t('auth.createTitle')}</h1>
      <p className="auth-sub">{t('auth.createSub')}</p>

      {error && (
        <Alert
          type="error"
          title={error}
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
            { max: 24, message: t('auth.validation.usernameMax') },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('auth.usernamePlaceholder')}
            size="large"
            autoComplete="username"
            autoFocus
            maxLength={24}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('auth.password')}
          rules={[
            { required: true, message: t('errors.required') },
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                const failed = passwordRules.find((r) => !r.test(value));
                return failed
                  ? Promise.reject(new Error(failed.label))
                  : Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth.passwordPlaceholder')}
            size="large"
            autoComplete="new-password"
            maxLength={72}
            onChange={(e) => setPasswordValue(e.target.value)}
          />
        </Form.Item>

        {passwordValue.length > 0 && (
          <div className="password-requirements">
            {passwordRules.map((rule) => {
              const met = rule.test(passwordValue);
              return (
                <div key={rule.key} className={`pw-rule ${met ? 'pw-rule--met' : 'pw-rule--unmet'}`}>
                  {met ? (
                    <CheckCircleFilled className="pw-rule-icon pw-rule-icon--met" />
                  ) : (
                    <CloseCircleFilled className="pw-rule-icon pw-rule-icon--unmet" />
                  )}
                  <span>{rule.label}</span>
                </div>
              );
            })}
          </div>
        )}

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
            placeholder={t('auth.confirmPasswordPlaceholder')}
            size="large"
            autoComplete="new-password"
            maxLength={72}
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
    </AuthLayout>
  );
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  User,
  Shield
} from 'lucide-react'
import { validateCPFCNPJ, formatCPFCNPJ } from '@/lib/utils/brazilian-validators'

export interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
  holderInfo: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    phone: string
    addressComplement?: string
    province?: string
    city?: string
    state?: string
  }
}

interface CreditCardFormProps {
  data: Partial<CreditCardData>
  onChange: (data: CreditCardData) => void
  onValidationChange: (isValid: boolean) => void
  maxInstallments?: number
  installments: number
  onInstallmentsChange: (installments: number) => void
  disabled?: boolean
  customerData?: {
    name?: string
    email?: string
    cpfCnpj?: string
    postalCode?: string
    addressNumber?: string
    phone?: string
    complement?: string
    province?: string
    city?: string
    state?: string
  }
}

export function CreditCardForm({
  data,
  onChange,
  onValidationChange,
  maxInstallments = 1,
  installments,
  onInstallmentsChange,
  disabled = false,
  customerData
}: CreditCardFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [cardBrand, setCardBrand] = useState<string>('')

  // Auto-populate holder info from customer data
  useEffect(() => {
    if (customerData && data.holderInfo) {
      const updatedHolderInfo = {
        ...data.holderInfo,
        name: customerData.name || data.holderInfo.name || '',
        email: customerData.email || data.holderInfo.email || '',
        cpfCnpj: customerData.cpfCnpj || data.holderInfo.cpfCnpj || '',
        postalCode: customerData.postalCode || data.holderInfo.postalCode || '',
        addressNumber: customerData.addressNumber || data.holderInfo.addressNumber || '',
        phone: customerData.phone || data.holderInfo.phone || '',
        addressComplement: customerData.complement || data.holderInfo.addressComplement,
        province: customerData.province || data.holderInfo.province,
        city: customerData.city || data.holderInfo.city,
        state: customerData.state || data.holderInfo.state
      }

      const updatedData = {
        ...data,
        holderName: customerData.name || data.holderName || '',
        holderInfo: updatedHolderInfo
      } as CreditCardData

      onChange(updatedData)
    }
  }, [customerData]) // Only depend on customerData

  const detectCardBrand = (number: string): string => {
    const digits = number.replace(/\D/g, '')
    
    if (/^4/.test(digits)) return 'Visa'
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard'
    if (/^3[47]/.test(digits)) return 'American Express'
    if (/^6(?:011|5)/.test(digits)) return 'Discover'
    if (/^50|^63|^67/.test(digits)) return 'Elo'
    
    return ''
  }

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted.substring(0, 23) // Max 19 digits + spaces
  }

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
    }
    return digits
  }

  const validateField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'holderName':
        return value.trim().length >= 2 ? '' : 'Nome deve ter pelo menos 2 caracteres'
      case 'number':
        const digits = value.replace(/\D/g, '')
        if (digits.length < 13) return 'Número do cartão inválido'
        return isValidCardNumber(digits) ? '' : 'Número do cartão inválido'
      case 'expiryMonth':
        const month = parseInt(value)
        return month >= 1 && month <= 12 ? '' : 'Mês inválido'
      case 'expiryYear':
        const year = parseInt(value)
        const currentYear = new Date().getFullYear() % 100
        return year >= currentYear && year <= currentYear + 20 ? '' : 'Ano inválido'
      case 'ccv':
        return value.length >= 3 && value.length <= 4 ? '' : 'CCV inválido'
      case 'holderInfo.cpfCnpj':
        return validateCPFCNPJ(value) ? '' : 'CPF/CNPJ do portador inválido'
      default:
        return ''
    }
  }, [])

  const isValidCardNumber = (number: string): boolean => {
    // Simple Luhn algorithm
    let sum = 0
    let isEven = false
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  const validateAllFields = useCallback((currentData: Partial<CreditCardData>) => {
    const requiredFields = ['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv']
    const newErrors: Record<string, string> = {}
    let isValid = true

    for (const field of requiredFields) {
      const value = currentData[field as keyof CreditCardData] as string || ''
      if (!value.trim()) {
        newErrors[field] = `${getFieldLabel(field)} é obrigatório`
        isValid = false
      } else {
        const error = validateField(field, value)
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    }

    // Validate expiry date combination
    if (currentData.expiryMonth && currentData.expiryYear) {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear() % 100
      const cardMonth = parseInt(currentData.expiryMonth)
      const cardYear = parseInt(currentData.expiryYear)

      if (cardYear === currentYear && cardMonth < currentMonth) {
        newErrors.expiryMonth = 'Cartão expirado'
        isValid = false
      }
    }

    // Validate holder info CPF
    if (currentData.holderInfo?.cpfCnpj) {
      const error = validateField('holderInfo.cpfCnpj', currentData.holderInfo.cpfCnpj)
      if (error) {
        newErrors['holderInfo.cpfCnpj'] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    onValidationChange(isValid)
  }, [validateField, onValidationChange])

  const handleFieldChange = (field: keyof CreditCardData | string, value: string) => {
    let formattedValue = value
    
    // Format specific fields
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
      const brand = detectCardBrand(value)
      setCardBrand(brand)
    } else if (field === 'ccv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    } else if (field === 'expiryMonth') {
      const month = value.replace(/\D/g, '').substring(0, 2)
      formattedValue = month
    } else if (field === 'expiryYear') {
      const year = value.replace(/\D/g, '').substring(0, 2)
      formattedValue = year
    } else if (field === 'holderInfo.cpfCnpj') {
      formattedValue = formatCPFCNPJ(value)
    }

    // Update data
    let updatedData = { ...data }
    
    if (field.includes('.')) {
      // Handle nested fields like holderInfo.cpfCnpj
      const [parent, child] = field.split('.')
      updatedData = {
        ...data,
        [parent]: {
          ...data[parent as keyof CreditCardData],
          [child]: formattedValue
        }
      } as CreditCardData
    } else {
      updatedData = { ...data, [field]: formattedValue } as CreditCardData
    }

    onChange(updatedData)
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate after change
    setTimeout(() => validateAllFields(updatedData), 100)
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      holderName: 'Nome do portador',
      number: 'Número do cartão',
      expiryMonth: 'Mês',
      expiryYear: 'Ano',
      ccv: 'CCV'
    }
    return labels[field] || field
  }

  const getBrandIcon = (brand: string) => {
    // In a real app, you'd have actual brand icons
    const brandColors: Record<string, string> = {
      'Visa': 'text-blue-600',
      'Mastercard': 'text-red-600',
      'American Express': 'text-green-600',
      'Elo': 'text-yellow-600'
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`${brandColors[brand] || 'text-gray-600'} border-current`}
      >
        {brand}
      </Badge>
    )
  }

  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Dados do Cartão de Crédito
            <Lock className="w-4 h-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Holder Name */}
          <div>
            <Label htmlFor="holderName" className="text-sm font-medium text-gray-700">
              Nome do Portador *
            </Label>
            <div className="relative mt-1">
              <Input
                id="holderName"
                type="text"
                placeholder="Nome como aparece no cartão"
                value={data.holderName || ''}
                onChange={(e) => handleFieldChange('holderName', e.target.value)}
                disabled={disabled}
                className={errors.holderName ? 'border-red-300 focus:border-red-500' : ''}
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {touched.holderName && errors.holderName && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.holderName}
              </p>
            )}
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700 flex items-center justify-between">
              Número do Cartão *
              {cardBrand && getBrandIcon(cardBrand)}
            </Label>
            <div className="relative mt-1">
              <Input
                id="cardNumber"
                type="text"
                placeholder="0000 0000 0000 0000"
                value={data.number || ''}
                onChange={(e) => handleFieldChange('number', e.target.value)}
                disabled={disabled}
                className={errors.number ? 'border-red-300 focus:border-red-500' : ''}
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {touched.number && errors.number && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.number}
              </p>
            )}
          </div>

          {/* Expiry and CCV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth" className="text-sm font-medium text-gray-700">
                Mês *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="expiryMonth"
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  value={data.expiryMonth || ''}
                  onChange={(e) => handleFieldChange('expiryMonth', e.target.value)}
                  disabled={disabled}
                  className={errors.expiryMonth ? 'border-red-300 focus:border-red-500' : ''}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {touched.expiryMonth && errors.expiryMonth && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.expiryMonth}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryYear" className="text-sm font-medium text-gray-700">
                Ano *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="expiryYear"
                  type="text"
                  placeholder="AA"
                  maxLength={2}
                  value={data.expiryYear || ''}
                  onChange={(e) => handleFieldChange('expiryYear', e.target.value)}
                  disabled={disabled}
                  className={errors.expiryYear ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              {touched.expiryYear && errors.expiryYear && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.expiryYear}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ccv" className="text-sm font-medium text-gray-700">
                CCV *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="ccv"
                  type="text"
                  placeholder="123"
                  maxLength={4}
                  value={data.ccv || ''}
                  onChange={(e) => handleFieldChange('ccv', e.target.value)}
                  disabled={disabled}
                  className={errors.ccv ? 'border-red-300 focus:border-red-500' : ''}
                />
                <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {touched.ccv && errors.ccv && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.ccv}
                </p>
              )}
            </div>
          </div>

          {/* Installments */}
          {maxInstallments > 1 && (
            <div>
              <Label htmlFor="installments" className="text-sm font-medium text-gray-700">
                Parcelas
              </Label>
              <select
                id="installments"
                value={installments}
                onChange={(e) => onInstallmentsChange(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {installmentOptions.map(option => (
                  <option key={option} value={option}>
                    {option}x {option === 1 ? 'à vista' : 'sem juros'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CPF for card holder validation */}
          {!customerData?.cpfCnpj && (
            <div>
              <Label htmlFor="holderCpf" className="text-sm font-medium text-gray-700">
                CPF do Portador *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="holderCpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={data.holderInfo?.cpfCnpj || ''}
                  onChange={(e) => handleFieldChange('holderInfo.cpfCnpj', e.target.value)}
                  disabled={disabled}
                  className={errors['holderInfo.cpfCnpj'] ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              {touched['holderInfo.cpfCnpj'] && errors['holderInfo.cpfCnpj'] && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors['holderInfo.cpfCnpj']}
                </p>
              )}
            </div>
          )}

          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Seus dados estão seguros. Utilizamos criptografia SSL e não armazenamos informações do cartão.
            </AlertDescription>
          </Alert>

          {Object.keys(errors).length === 0 && Object.keys(touched).length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Dados do cartão validados com sucesso!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
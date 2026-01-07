import type { CPRWizardData } from './schema'
import type { WizardData } from '@/types/cpr-wizard'

export function mapWizardDataToDraft(data: Partial<CPRWizardData>): WizardData {
  const guarantor =
    data.hasGuarantor && (data.guarantorName || data.guarantorCpfCnpj)
      ? {
          name: data.guarantorName,
          cpf_cnpj: data.guarantorCpfCnpj,
          address: data.guarantorAddress
        }
      : undefined

  return {
    producer: {
      name: data.producerName,
      cpf_cnpj: data.producerCpfCnpj,
      phone: data.producerPhone,
      email: data.producerEmail,
      address: data.producerAddress
    },
    farm: {
      name: data.farmName,
      car: data.farmCar || null,
      area_ha: data.farmArea,
      state: data.farmState,
      city: data.farmCity,
      address: data.farmAddress
    },
    crop: {
      commodity: data.commodity,
      safra: data.safra,
      expected_quantity: data.expectedQuantity,
      unit: data.unit,
      planting_date: data.plantingDate || null,
      harvest_date: data.harvestDate || null
    },
    values: {
      amount: data.amount,
      quantity: data.quantity,
      unit_price: data.unitPrice || null,
      issue_date: data.issueDate,
      due_date: data.dueDate,
      delivery_place: data.deliveryPlace,
      correction_index: data.correctionIndex
    },
    guarantees: {
      types: data.guaranteeType,
      description: data.guaranteeDescription,
      has_guarantor: data.hasGuarantor,
      guarantor
    }
  }
}

export function mapDraftToWizardData(
  data?: WizardData
): Partial<CPRWizardData> {
  if (!data) {
    return {}
  }

  return {
    producerName: data.producer?.name,
    producerCpfCnpj: data.producer?.cpf_cnpj,
    producerPhone: data.producer?.phone,
    producerEmail: data.producer?.email,
    producerAddress: data.producer?.address,
    farmName: data.farm?.name,
    farmCar: data.farm?.car || undefined,
    farmArea: data.farm?.area_ha,
    farmState: data.farm?.state,
    farmCity: data.farm?.city,
    farmAddress: data.farm?.address,
    commodity: data.crop?.commodity,
    safra: data.crop?.safra,
    expectedQuantity: data.crop?.expected_quantity,
    unit: data.crop?.unit,
    plantingDate: data.crop?.planting_date || undefined,
    harvestDate: data.crop?.harvest_date || undefined,
    amount: data.values?.amount,
    quantity: data.values?.quantity,
    unitPrice: data.values?.unit_price || undefined,
    issueDate: data.values?.issue_date,
    dueDate: data.values?.due_date,
    deliveryPlace: data.values?.delivery_place,
    correctionIndex: data.values?.correction_index,
    guaranteeType: data.guarantees?.types,
    guaranteeDescription: data.guarantees?.description,
    hasGuarantor: data.guarantees?.has_guarantor ?? false,
    guarantorName: data.guarantees?.guarantor?.name,
    guarantorCpfCnpj: data.guarantees?.guarantor?.cpf_cnpj,
    guarantorAddress: data.guarantees?.guarantor?.address
  }
}

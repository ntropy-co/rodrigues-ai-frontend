import type { CPRWizardData } from './schema'
import type { WizardData, WizardGuarantor } from '@/types/cpr-wizard'

export function mapWizardDataToDraft(data: Partial<CPRWizardData>): WizardData {
  const guarantor: WizardGuarantor | undefined =
    data.hasGuarantor && (data.guarantorName || data.guarantorCpfCnpj)
      ? {
          name: data.guarantorName as string | undefined,
          cpf_cnpj: data.guarantorCpfCnpj as string | undefined,
          address: data.guarantorAddress as string | undefined
        }
      : undefined

  return {
    producer: {
      name: data.producerName as string | undefined,
      cpf_cnpj: data.producerCpfCnpj as string | undefined,
      phone: data.producerPhone as string | undefined,
      email: data.producerEmail as string | undefined,
      address: data.producerAddress as string | undefined
    },
    farm: {
      name: data.farmName as string | undefined,
      car: (data.farmCar as string | undefined) || null,
      area_ha: data.farmArea as number | undefined,
      state: data.farmState as string | undefined,
      city: data.farmCity as string | undefined,
      address: data.farmAddress as string | undefined
    },
    crop: {
      commodity: data.commodity as string | undefined,
      safra: data.safra as string | undefined,
      expected_quantity: data.expectedQuantity as number | undefined,
      unit: data.unit as string | undefined,
      planting_date: (data.plantingDate as string | undefined) || null,
      harvest_date: (data.harvestDate as string | undefined) || null
    },
    values: {
      amount: data.amount as number | undefined,
      quantity: data.quantity as number | undefined,
      unit_price: (data.unitPrice as number | undefined) || null,
      issue_date: data.issueDate as string | undefined,
      due_date: data.dueDate as string | undefined,
      delivery_place: data.deliveryPlace as string | undefined,
      correction_index: data.correctionIndex as
        | 'IPCA'
        | 'IGP-M'
        | 'Nenhum'
        | undefined
    },
    guarantees: {
      types: data.guaranteeType as string[] | undefined,
      description: data.guaranteeDescription as string | undefined,
      has_guarantor: data.hasGuarantor as boolean | undefined,
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

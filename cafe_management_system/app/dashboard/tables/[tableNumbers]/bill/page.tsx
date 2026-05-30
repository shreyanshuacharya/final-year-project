import TableBillPage from './TableBillPage'

export default async function Page({ params }: { params: Promise<{ tableNumber: string }> }) {
  const { tableNumber } = await params
  return <TableBillPage tableNumber={tableNumber} />
}
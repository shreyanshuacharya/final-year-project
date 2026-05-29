import TableOrderPage from './TableOrderPage'

export default function Page({ params }: { params: { tableNumber: string } }) {
  return <TableOrderPage tableNumber={params.tableNumber} />
}
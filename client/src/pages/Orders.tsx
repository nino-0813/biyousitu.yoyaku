import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function Orders() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = trpc.orders.list.useQuery(
    { productId: undefined }
  );

  const { data: products } = trpc.products.list.useQuery();

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("発注履歴を追加しました");
      setIsAddDialogOpen(false);
      refetchOrders();
    },
    onError: (error) => {
      toast.error("発注履歴の追加に失敗しました: " + error.message);
    },
  });

  const handleAddOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createOrder.mutate({
      productId: parseInt(formData.get("productId") as string),
      orderDate: new Date(formData.get("orderDate") as string),
      quantity: parseInt(formData.get("quantity") as string),
      totalPrice: parseInt(formData.get("totalPrice") as string),
      supplier: formData.get("supplier") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">発注履歴</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                発注を記録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleAddOrder}>
                <DialogHeader>
                  <DialogTitle>発注を記録</DialogTitle>
                  <DialogDescription>発注情報を入力してください</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="productId">商品 *</Label>
                    <Select name="productId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="商品を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderDate">発注日 *</Label>
                    <Input
                      id="orderDate"
                      name="orderDate"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">数量 *</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalPrice">合計金額(円) *</Label>
                      <Input id="totalPrice" name="totalPrice" type="number" min="0" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">仕入先</Label>
                    <Input id="supplier" name="supplier" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">備考</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createOrder.isPending}>
                    {createOrder.isPending ? "記録中..." : "記録"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>発注履歴一覧</CardTitle>
            <CardDescription>過去の発注記録です</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>発注日</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">合計金額</TableHead>
                      <TableHead>仕入先</TableHead>
                      <TableHead>担当者</TableHead>
                      <TableHead>備考</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell className="font-medium">{order.productName}</TableCell>
                        <TableCell className="text-right">{order.quantity}</TableCell>
                        <TableCell className="text-right">¥{order.totalPrice.toLocaleString()}</TableCell>
                        <TableCell>{order.supplier || "-"}</TableCell>
                        <TableCell>{order.userName || "-"}</TableCell>
                        <TableCell>{order.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                発注履歴がありません。「発注を記録」ボタンから記録してください。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

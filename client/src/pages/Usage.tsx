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

export default function Usage() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: usageHistory, isLoading: usageLoading, refetch: refetchUsage } = trpc.usage.list.useQuery(
    { productId: undefined }
  );

  const { data: products } = trpc.products.list.useQuery();

  const createUsage = trpc.usage.create.useMutation({
    onSuccess: () => {
      toast.success("使用履歴を追加しました");
      setIsAddDialogOpen(false);
      refetchUsage();
    },
    onError: (error) => {
      toast.error("使用履歴の追加に失敗しました: " + error.message);
    },
  });

  const handleAddUsage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createUsage.mutate({
      productId: parseInt(formData.get("productId") as string),
      usageDate: new Date(formData.get("usageDate") as string),
      quantity: parseInt(formData.get("quantity") as string),
      notes: formData.get("notes") as string || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">使用履歴</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                使用を記録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleAddUsage}>
                <DialogHeader>
                  <DialogTitle>使用を記録</DialogTitle>
                  <DialogDescription>使用情報を入力してください</DialogDescription>
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
                    <Label htmlFor="usageDate">使用日 *</Label>
                    <Input
                      id="usageDate"
                      name="usageDate"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">数量 *</Label>
                    <Input id="quantity" name="quantity" type="number" min="1" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">備考</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createUsage.isPending}>
                    {createUsage.isPending ? "記録中..." : "記録"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>使用履歴一覧</CardTitle>
            <CardDescription>過去の使用記録です</CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : usageHistory && usageHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>使用日</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead>担当者</TableHead>
                      <TableHead>備考</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageHistory.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{new Date(usage.usageDate).toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell className="font-medium">{usage.productName}</TableCell>
                        <TableCell className="text-right">{usage.quantity}</TableCell>
                        <TableCell>{usage.userName || "-"}</TableCell>
                        <TableCell>{usage.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                使用履歴がありません。「使用を記録」ボタンから記録してください。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

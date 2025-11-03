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
import { AlertCircle, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function Products() {
  const { user, loading: authLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();

  const { data: lowStockProducts } = trpc.products.lowStock.useQuery();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("商品を追加しました");
      setIsAddDialogOpen(false);
      setSelectedCategoryId("");
      refetchProducts();
    },
    onError: (error) => {
      toast.error("商品の追加に失敗しました: " + error.message);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("商品を更新しました");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      refetchProducts();
    },
    onError: (error) => {
      toast.error("商品の更新に失敗しました: " + error.message);
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("商品を削除しました");
      refetchProducts();
    },
    onError: (error) => {
      toast.error("商品の削除に失敗しました: " + error.message);
    },
  });

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryId = selectedCategoryId || formData.get("categoryId") as string;
    if (!categoryId) {
      toast.error("カテゴリを選択してください");
      return;
    }
    createProduct.mutate({
      name: formData.get("name") as string,
      categoryId: parseInt(categoryId),
      currentStock: parseInt(formData.get("currentStock") as string) || 0,
      minStock: parseInt(formData.get("minStock") as string) || 0,
      unit: formData.get("unit") as string || "個",
      pricePerUnit: parseInt(formData.get("pricePerUnit") as string) || 0,
      supplier: formData.get("supplier") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryId = editingProduct?.categoryId?.toString() || formData.get("categoryId") as string;
    if (!categoryId) {
      toast.error("カテゴリを選択してください");
      return;
    }
    updateProduct.mutate({
      id: editingProduct.id,
      name: formData.get("name") as string,
      categoryId: parseInt(categoryId),
      currentStock: parseInt(formData.get("currentStock") as string),
      minStock: parseInt(formData.get("minStock") as string),
      unit: formData.get("unit") as string,
      pricePerUnit: parseInt(formData.get("pricePerUnit") as string),
      supplier: formData.get("supplier") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`「${name}」を削除してもよろしいですか?`)) {
      deleteProduct.mutate({ id });
    }
  };

  const lowStockCount = lowStockProducts?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {lowStockCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">在庫アラート</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                {lowStockCount}件の商品が最小在庫数を下回っています
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">商品一覧</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setSelectedCategoryId("");
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                商品を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleAddProduct}>
                <DialogHeader>
                  <DialogTitle>商品を追加</DialogTitle>
                  <DialogDescription>新しい商品の情報を入力してください</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">商品名 *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoryId">カテゴリ *</Label>
                    <Select 
                      value={selectedCategoryId} 
                      onValueChange={setSelectedCategoryId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="categoryId" value={selectedCategoryId} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentStock">現在の在庫数</Label>
                      <Input id="currentStock" name="currentStock" type="number" defaultValue="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minStock">最小在庫数</Label>
                      <Input id="minStock" name="minStock" type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit">単位</Label>
                      <Input id="unit" name="unit" defaultValue="個" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pricePerUnit">単価(円)</Label>
                      <Input id="pricePerUnit" name="pricePerUnit" type="number" defaultValue="0" />
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
                  <Button type="submit" disabled={createProduct.isPending}>
                    {createProduct.isPending ? "追加中..." : "追加"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>全商品</CardTitle>
            <CardDescription>登録されている全ての商品の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead className="text-right">在庫数</TableHead>
                      <TableHead className="text-right">最小在庫</TableHead>
                      <TableHead>単位</TableHead>
                      <TableHead className="text-right">単価</TableHead>
                      <TableHead>仕入先</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const isLowStock = product.currentStock <= product.minStock;
                      return (
                        <TableRow key={product.id} className={isLowStock ? "bg-orange-50" : ""}>
                          <TableCell className="font-medium">
                            {product.name}
                            {isLowStock && (
                              <Badge variant="destructive" className="ml-2">
                                在庫少
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{product.categoryName}</TableCell>
                          <TableCell className="text-right">{product.currentStock}</TableCell>
                          <TableCell className="text-right">{product.minStock}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className="text-right">¥{product.pricePerUnit.toLocaleString()}</TableCell>
                          <TableCell>{product.supplier || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                商品が登録されていません。「商品を追加」ボタンから登録してください。
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingProduct && (
            <form onSubmit={handleEditProduct}>
              <DialogHeader>
                <DialogTitle>商品を編集</DialogTitle>
                <DialogDescription>商品情報を更新してください</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">商品名 *</Label>
                  <Input id="edit-name" name="name" defaultValue={editingProduct.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-categoryId">カテゴリ *</Label>
                  <Select 
                    value={editingProduct?.categoryId?.toString() || ""}
                    onValueChange={(value) => {
                      setEditingProduct({ ...editingProduct, categoryId: parseInt(value) });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="categoryId" value={editingProduct?.categoryId?.toString() || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-currentStock">現在の在庫数</Label>
                    <Input
                      id="edit-currentStock"
                      name="currentStock"
                      type="number"
                      defaultValue={editingProduct.currentStock}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-minStock">最小在庫数</Label>
                    <Input id="edit-minStock" name="minStock" type="number" defaultValue={editingProduct.minStock} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-unit">単位</Label>
                    <Input id="edit-unit" name="unit" defaultValue={editingProduct.unit} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-pricePerUnit">単価(円)</Label>
                    <Input
                      id="edit-pricePerUnit"
                      name="pricePerUnit"
                      type="number"
                      defaultValue={editingProduct.pricePerUnit}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-supplier">仕入先</Label>
                  <Input id="edit-supplier" name="supplier" defaultValue={editingProduct.supplier || ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">備考</Label>
                  <Textarea id="edit-notes" name="notes" rows={3} defaultValue={editingProduct.notes || ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? "更新中..." : "更新"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

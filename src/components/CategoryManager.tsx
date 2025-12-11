import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RunningOrderCategory } from '@/types'
import { Plus, Edit2, Trash2, FolderPlus } from 'lucide-react'

interface CategoryManagerProps {
  categories: RunningOrderCategory[]
  runningOrderCountByCategory?: Record<string, number>
  onUpdateCategories: (categories: RunningOrderCategory[]) => void
}

export function CategoryManager({
  categories,
  runningOrderCountByCategory = {},
  onUpdateCategories
}: CategoryManagerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<RunningOrderCategory | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: RunningOrderCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        items: []
      }
      onUpdateCategories([...categories, newCategory])
      setNewCategoryName('')
      setAddDialogOpen(false)
    }
  }

  const editCategory = (category: RunningOrderCategory) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setEditDialogOpen(true)
  }

  const saveEditCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: newCategoryName.trim() }
          : cat
      )
      onUpdateCategories(updatedCategories)
      setEditingCategory(null)
      setNewCategoryName('')
      setEditDialogOpen(false)
    }
  }

  const deleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all items in this category.')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      onUpdateCategories(updatedCategories)
    }
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Manage Categories
            </CardTitle>
            <CardDescription>
              Create and organize categories for your running order items
            </CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No categories created yet</p>
            <Button onClick={() => setAddDialogOpen(true)} variant="outline">
              Create Your First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 border rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editCategory(category)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(runningOrderCountByCategory[category.id] ?? category.items.length ?? 0)} items
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Category Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your running order items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Team Arrival, Pre-Match, Half-Time"
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={addCategory}
                disabled={!newCategoryName.trim()}
              >
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category name
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditCategory()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveEditCategory}
                disabled={!newCategoryName.trim()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

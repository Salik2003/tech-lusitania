'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { Star, Trash2, Upload, GripVertical } from 'lucide-react'
import { ProductImage } from '@/types'

const MAX_IMAGES = 8
const MAX_SIZE = 5 * 1024 * 1024

export default function ImageManagerPage() {
  const { id: productId } = useParams<{ id: string }>()
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/images`)
      .then((r) => r.json())
      .then((d) => {
        setImages(d.images ?? [])
        setLoading(false)
      })
  }, [productId])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`)
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      if (file.size > MAX_SIZE) {
        toast.error('File must be under 5MB')
        return
      }

      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setImages((prev) => [...prev, data.image])
        toast.success('Image uploaded')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Upload failed')
      }

      setUploading(false)
      setProgress(0)
    },
    [productId, images.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    disabled: uploading || images.length >= MAX_IMAGES,
  })

  async function handleSetPrimary(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId, action: 'set_primary' }),
    })
    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      )
      toast.success('Primary image updated')
    }
  }

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image deleted')
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(images)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const updated = reordered.map((img, i) => ({ ...img, sort_order: i }))
    setImages(updated)

    await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', order: updated.map((img) => img.id) }),
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Image Manager</h1>

      {images.length < MAX_IMAGES ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition mb-6 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB</p>
          {uploading && (
            <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
          Maximum {MAX_IMAGES} images reached. Delete an image to upload a new one.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading images…</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-gray-500">No images yet. Upload one above.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-4"
              >
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative w-40 h-40 rounded-xl overflow-hidden border-2 transition ${
                          image.is_primary ? 'border-blue-500' : 'border-gray-200'
                        } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || 'Product image'}
                          fill
                          className="object-cover"
                        />
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-1 left-1 bg-black/40 rounded p-1 cursor-grab"
                        >
                          <GripVertical size={12} className="text-white" />
                        </div>
                        {image.is_primary && (
                          <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-black/50 py-1.5 opacity-0 hover:opacity-100 transition">
                          {!image.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(image.id)}
                              className="text-yellow-400 hover:text-yellow-300"
                              title="Set as primary"
                            >
                              <Star size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}

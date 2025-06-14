import { motion } from 'framer-motion'
import { 
  MousePointer, 
  Scissors, 
  Type, 
  Palette, 
  Volume2, 
  Zap,
  Layers,
  Filter
} from 'lucide-react'

interface Props {
  selectedTool: string
  onToolSelect: (tool: string) => void
}

const tools = [
  { id: 'select', name: 'Select', icon: MousePointer },
  { id: 'trim', name: 'Trim', icon: Scissors },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'color', name: 'Color', icon: Palette },
  { id: 'audio', name: 'Audio', icon: Volume2 },
  { id: 'effects', name: 'Effects', icon: Zap },
  { id: 'layers', name: 'Layers', icon: Layers },
  { id: 'filters', name: 'Filters', icon: Filter },
]

const templates = [
  { id: 'social', name: 'Social Media', description: 'Square format for Instagram' },
  { id: 'youtube', name: 'YouTube', description: '16:9 landscape format' },
  // { id: 'tiktok', name: 'TikTok', description: '9:16 vertical format' },
  // { id: 'podcast', name: 'Podcast', description: 'Audio-focused template' },
]

const ToolPanel = ({ selectedTool, onToolSelect }: Props) => {
  return (
    <div className="p-4   flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-purple-300">Tools & Templates</h3>
      
      {/* Tools */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(tool.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tool.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Templates */}
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Templates</h4>
        <div className="space-y-2">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer transition-colors"
            >
              <h5 className="text-sm font-medium text-white">{template.name}</h5>
              <p className="text-xs text-gray-400 mt-1">{template.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ToolPanel

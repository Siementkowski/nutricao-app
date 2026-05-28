import { useDiary } from './useDiary'
import { useUserStore } from '../store/userStore'

export function useWater() {
  const { waterToday, addWater, fetchTodayWater } = useDiary()
  const { goals } = useUserStore()

  const pct = Math.min(100, Math.round((waterToday / goals.water_goal_ml) * 100))

  return {
    waterToday,
    goal: goals.water_goal_ml,
    pct,
    addWater,
    fetchTodayWater,
  }
}

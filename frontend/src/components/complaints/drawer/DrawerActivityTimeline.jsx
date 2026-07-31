import { DrawerSection } from './DrawerSection';
import { ActivityTimeline } from '../ActivityTimeline';

export function DrawerActivityTimeline({ logs }) {
  return (
    <DrawerSection title="Activity Timeline">
      <ActivityTimeline logs={logs} bare />
    </DrawerSection>
  );
}

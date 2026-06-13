import { render } from "@react-email/render";
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
  pnr: string;
  origin: string;
  destination: string;
  departureAt: string;
  passengerCount: number;
  totalFareMinor: number;
}

export function BookingConfirmationEmail({
  pnr,
  origin,
  destination,
  departureAt,
  passengerCount,
  totalFareMinor,
}: BookingConfirmationProps) {
  const fare = `₹${(totalFareMinor / 100).toFixed(2)}`;
  const departure = new Date(departureAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview>Your urRoute booking {pnr} is confirmed</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "24px 0" }}>
          <Section style={{ backgroundColor: "#fff", borderRadius: 8, padding: 32 }}>
            <Heading style={{ color: "#0f172a", fontSize: 22, margin: "0 0 8px" }}>
              Booking Confirmed
            </Heading>
            <Text style={{ color: "#64748b", margin: "0 0 24px" }}>
              Your journey is booked. Have a great trip!
            </Text>
            <Hr />
            <Row style={{ marginTop: 20 }}>
              <Column>
                <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>PNR</Text>
                <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "bold", margin: "4px 0 0" }}>
                  {pnr}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Column>
                <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>From</Text>
                <Text style={{ color: "#0f172a", fontWeight: "bold", margin: "4px 0 0" }}>{origin}</Text>
              </Column>
              <Column>
                <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>To</Text>
                <Text style={{ color: "#0f172a", fontWeight: "bold", margin: "4px 0 0" }}>{destination}</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Column>
                <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>Departure</Text>
                <Text style={{ color: "#0f172a", margin: "4px 0 0" }}>{departure}</Text>
              </Column>
              <Column>
                <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>Passengers</Text>
                <Text style={{ color: "#0f172a", margin: "4px 0 0" }}>{passengerCount}</Text>
              </Column>
            </Row>
            <Hr style={{ marginTop: 24 }} />
            <Row style={{ marginTop: 16 }}>
              <Column>
                <Text style={{ color: "#0f172a", fontWeight: "bold", fontSize: 16, margin: 0 }}>
                  Total: {fare}
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderBookingConfirmationEmail(
  props: BookingConfirmationProps,
): Promise<string> {
  return render(<BookingConfirmationEmail {...props} />);
}
